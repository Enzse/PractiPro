<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Uploaded files: requirement submissions, weekly documentation, final report
 * files, supervisors' evaluation files and seminar certificates; plus the
 * approval flags coordinators and supervisors set on student records.
 *
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
        match ($table) {
            'submissions' => $this->db->execute(
                'INSERT INTO submissions (user_id, submission_name, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)',
                [$studentId, $label, $file['name'], $file['type'], $file['size'], $file['data']],
            ),
            'documentations', 'war' => $this->db->execute(
                "INSERT INTO $table (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)",
                [$studentId, $label, $file['name'], $file['type'], $file['size'], $file['data']],
            ),
            'finalreports' => $this->db->execute(
                'INSERT INTO finalreports (user_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?)',
                [$studentId, $file['name'], $file['type'], $file['size'], $file['data']],
            ),
            default => throw self::unknown($table),
        };
    }

    /**
     * @return array{file_name: string, file_data: string}|null
     */
    public function download(string $table, int $id): ?array
    {
        $column = self::DOWNLOADABLE_TABLES[$table] ?? throw self::unknown($table);
        /** @var array{file_name: string, file_data: string}|null */
        return $this->db->fetchOne("SELECT file_name, file_data FROM $table WHERE $column = ? LIMIT 1", [$id]);
    }

    public function delete(string $table, int $id): int
    {
        if (!array_key_exists($table, self::DOWNLOADABLE_TABLES) || $table === 'student_seminar_certificates') {
            throw self::unknown($table);
        }

        return $this->db->execute("DELETE FROM $table WHERE id = ?", [$id]);
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
        $this->db->execute(
            'INSERT INTO supervisor_student_evaluations (user_id, student_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)',
            [$supervisorId, $studentId, $file['name'], $file['type'], $file['size'], $file['data']],
        );
    }

    private static function unknown(string $table): \InvalidArgumentException
    {
        return new \InvalidArgumentException("Table '$table' is not allowed here.");
    }
}
