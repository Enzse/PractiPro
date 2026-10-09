<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

use PractiPro\Database\Database;
use PractiPro\Support\FileStorage;

/**
 * Uploaded files: requirement submissions, weekly documentation, final report
 * files, supervisors' evaluation files and seminar certificates; plus the
 * approval flags coordinators and supervisors set on student records.
 *
 * The files themselves live in FileStorage; rows keep their file_path.
 * Table names can't be bound as query parameters, so every method that takes
 * one checks it against a constant allow-list first.
 */
final class SubmissionRepository extends Repository
{
    /** Tables students upload files to, with the columns listed (file contents excluded). */
    public const STUDENT_FILE_TABLES = [
        'submissions' => 'id, user_id, submission_name, file_name, created_at, remarks, comments, advisor_approval',
        'documentations' => 'id, user_id, week, file_name, created_at, remarks, comments, advisor_approval',
        'finalreports' => 'id, user_id, file_name, created_at, remarks, comments, advisor_approval',
        'war' => 'id, user_id, week, file_name, created_at, remarks, comments, supervisor_approval, advisor_approval',
    ];

    /** Tables a file can be downloaded from, with the column the id refers to. */
    public const DOWNLOADABLE_TABLES = [
        'submissions' => 'id',
        'documentations' => 'id',
        'finalreports' => 'id',
        'war' => 'id',
        'supervisor_student_evaluations' => 'id',
        'student_seminar_certificates' => 'record_id',
    ];

    /** Tables whose records have a numbered week, for building week tabs. */
    public const WEEKLY_TABLES = ['documentations', 'student_war_records'];

    /** Tables with an advisor_approval column a coordinator can set. */
    public const ADVISOR_APPROVAL_TABLES = [
        'submissions', 'documentations', 'finalreports', 'war', 'student_final_reports', 'student_seminar_records',
        'student_supervisor_evaluation', 'student_war_records', 'supervisor_student_evaluations',
    ];

    /** Tables with a supervisor_approval column a supervisor can set. */
    public const SUPERVISOR_APPROVAL_TABLES = ['student_war_records', 'war'];

    public function __construct(Database $db, private readonly FileStorage $files)
    {
        parent::__construct($db);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function studentFiles(string $table, ?int $studentId): array
    {
        $columns = self::STUDENT_FILE_TABLES[$table] ?? throw self::unknown($table);

        return $studentId === null
            ? $this->db->fetchAll("SELECT $columns FROM $table")
            : $this->db->fetchAll("SELECT $columns FROM $table WHERE user_id = ?", [$studentId]);
    }

    /**
     * @param array{name: string, type: string, size: int, data: string} $file
     * @param string|int|null $label Requirement name for submissions, week number for weekly tables.
     */
    public function storeStudentFile(string $table, int $studentId, array $file, string|int|null $label): void
    {
        if (!array_key_exists($table, self::STUDENT_FILE_TABLES)) {
            throw self::unknown($table);
        }

        $this->storeThen($table, $file, fn (string $path) => match ($table) {
            'submissions' => $this->db->execute(
                'INSERT INTO submissions (user_id, submission_name, file_name, file_type, file_size, file_path) VALUES (?, ?, ?, ?, ?, ?)',
                [$studentId, $label, $file['name'], $file['type'], $file['size'], $path],
            ),
            'documentations', 'war' => $this->db->execute(
                "INSERT INTO $table (user_id, week, file_name, file_type, file_size, file_path) VALUES (?, ?, ?, ?, ?, ?)",
                [$studentId, $label, $file['name'], $file['type'], $file['size'], $path],
            ),
            default => $this->db->execute(
                'INSERT INTO finalreports (user_id, file_name, file_type, file_size, file_path) VALUES (?, ?, ?, ?, ?)',
                [$studentId, $file['name'], $file['type'], $file['size'], $path],
            ),
        });
    }

    /**
     * @return array{name: string, contents: string}|null
     */
    public function download(string $table, int $id): ?array
    {
        $column = self::DOWNLOADABLE_TABLES[$table] ?? throw self::unknown($table);
        $row = $this->db->fetchOne("SELECT file_name, file_path FROM $table WHERE $column = ? LIMIT 1", [$id]);
        if ($row === null || !is_string($row['file_path'])) {
            return null;
        }
        $contents = $this->files->get($row['file_path']);

        return $contents === null ? null : ['name' => (string) $row['file_name'], 'contents' => $contents];
    }

    public function delete(string $table, int $id): int
    {
        if (!array_key_exists($table, self::DOWNLOADABLE_TABLES) || $table === 'student_seminar_certificates') {
            throw self::unknown($table);
        }
        $path = $this->db->fetchValue("SELECT file_path FROM $table WHERE id = ?", [$id]);
        $deleted = $this->db->execute("DELETE FROM $table WHERE id = ?", [$id]);
        if ($deleted > 0 && is_string($path)) {
            $this->files->delete($path);
        }

        return $deleted;
    }

    /**
     * The week numbers to show as tabs: 1 up to the highest week the student has used.
     *
     * @return list<int>
     */
    public function weekNumbers(string $table, int $studentId): array
    {
        if (!in_array($table, self::WEEKLY_TABLES, true)) {
            throw self::unknown($table);
        }
        $maxWeek = $this->db->fetchValue("SELECT MAX(week) FROM $table WHERE user_id = ?", [$studentId]);

        return range(1, max(1, (int) $maxWeek));
    }

    public function setAdvisorApproval(string $table, int $id, mixed $approval): void
    {
        if (!in_array($table, self::ADVISOR_APPROVAL_TABLES, true)) {
            throw self::unknown($table);
        }
        $this->db->execute("UPDATE $table SET advisor_approval = ? WHERE id = ?", [$approval, $id]);
    }

    public function setSupervisorApproval(string $table, int $id, mixed $approval): void
    {
        if (!in_array($table, self::SUPERVISOR_APPROVAL_TABLES, true)) {
            throw self::unknown($table);
        }
        $this->db->execute("UPDATE $table SET supervisor_approval = ? WHERE id = ?", [$approval, $id]);
    }

    /**
     * Who uploaded a supervisor evaluation file.
     */
    public function evaluationUploader(int $id): ?int
    {
        $uploader = $this->db->fetchValue('SELECT user_id FROM supervisor_student_evaluations WHERE id = ?', [$id]);

        return $uploader === false ? null : (int) $uploader;
    }

    // Evaluation files supervisors upload for their students.

    /**
     * @return list<array<string, mixed>>
     */
    public function evaluationFilesFor(int $studentId): array
    {
        return $this->db->fetchAll(
            'SELECT sse.id, sse.user_id, sse.student_id, sse.file_name, sse.created_at, sse.advisor_approval, sse.comments,
                    s.firstName AS sfirstName, s.lastName AS slastName
             FROM supervisor_student_evaluations sse
             JOIN supervisors s ON sse.user_id = s.id
             WHERE sse.student_id = ?',
            [$studentId],
        );
    }

    /**
     * @param array{name: string, type: string, size: int, data: string} $file
     */
    public function storeEvaluationFile(int $supervisorId, int $studentId, array $file): void
    {
        $this->storeThen('supervisor_student_evaluations', $file, fn (string $path) => $this->db->execute(
            'INSERT INTO supervisor_student_evaluations (user_id, student_id, file_name, file_type, file_size, file_path) VALUES (?, ?, ?, ?, ?, ?)',
            [$supervisorId, $studentId, $file['name'], $file['type'], $file['size'], $path],
        ));
    }

    /**
     * Every stored file belonging to an account, so they can be removed along with it.
     *
     * @return list<string>
     */
    public function filePathsOfUser(int $userId): array
    {
        $queries = [];
        foreach (['submissions', 'documentations', 'finalreports', 'war', 'student_war', 'dtr'] as $table) {
            $queries[] = ["SELECT file_path FROM $table WHERE user_id = ?", [$userId]];
        }
        $queries[] = ['SELECT file_path FROM supervisor_student_evaluations WHERE user_id = ? OR student_id = ?', [$userId, $userId]];
        $queries[] = [
            'SELECT c.file_path FROM student_seminar_certificates c
             JOIN student_seminar_records r ON r.id = c.record_id WHERE r.student_id = ?',
            [$userId],
        ];
        $queries[] = ['SELECT file_path FROM user_avatars WHERE user_id = ?', [$userId]];

        $paths = [];
        foreach ($queries as [$sql, $params]) {
            foreach ($this->db->fetchAll($sql, $params) as $row) {
                if (is_string($row['file_path'])) {
                    $paths[] = $row['file_path'];
                }
            }
        }

        return $paths;
    }

    public function deleteFiles(string ...$paths): void
    {
        foreach ($paths as $path) {
            $this->files->delete($path);
        }
    }

    /**
     * Saves the file, then runs the insert. If the insert fails, the file is
     * removed again so storage never holds files that no row points to.
     *
     * @param array{name: string, type: string, size: int, data: string} $file
     * @param callable(string): mixed $insert
     */
    private function storeThen(string $folder, array $file, callable $insert): void
    {
        $path = $this->files->put($folder, $file['data'], $file['type']);
        try {
            $insert($path);
        } catch (\Throwable $e) {
            $this->files->delete($path);
            throw $e;
        }
    }

    private static function unknown(string $table): \InvalidArgumentException
    {
        return new \InvalidArgumentException("Table '$table' is not allowed here.");
    }
}
