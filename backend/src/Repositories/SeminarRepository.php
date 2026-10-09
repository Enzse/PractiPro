<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

use PractiPro\Database\Database;
use PractiPro\Support\FileStorage;

/**
 * Seminars students attend, each with an optional certificate file
 * (kept in FileStorage).
 */
final class SeminarRepository extends Repository
{
    public function __construct(Database $db, private readonly FileStorage $files)
    {
        parent::__construct($db);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function forStudent(int $studentId): array
    {
        return $this->db->fetchAll('SELECT * FROM student_seminar_records WHERE student_id = ?', [$studentId]);
    }

    /**
     * @param array<string, mixed> $record
     */
    public function create(int $studentId, array $record): int
    {
        return $this->db->insert(
            'INSERT INTO student_seminar_records (student_id, event_name, event_date, event_type, duration) VALUES (?, ?, ?, ?, ?)',
            [$studentId, $record['event_name'], $record['event_date'], $record['event_type'], $record['duration']],
        );
    }

    /**
     * Stores the certificate and marks the seminar record as certified.
     *
     * @param array{name: string, type: string, size: int, data: string} $file
     */
    public function attachCertificate(int $recordId, array $file): void
    {
        $path = $this->files->put('student_seminar_certificates', $file['data'], $file['type']);
        try {
            $this->db->transaction(function () use ($recordId, $file, $path) {
                $this->db->execute(
                    'INSERT INTO student_seminar_certificates (record_id, file_name, file_type, file_size, file_path) VALUES (?, ?, ?, ?, ?)',
                    [$recordId, $file['name'], $file['type'], $file['size'], $path],
                );
                $this->db->execute('UPDATE student_seminar_records SET certified = 1 WHERE id = ?', [$recordId]);
            });
        } catch (\Throwable $e) {
            $this->files->delete($path);
            throw $e;
        }
    }

    /**
     * Deletes the record; its certificates go with it (ON DELETE CASCADE),
     * so their files are removed too.
     */
    public function delete(int $id): int
    {
        $certificates = array_column(
            $this->db->fetchAll('SELECT file_path FROM student_seminar_certificates WHERE record_id = ?', [$id]),
            'file_path',
        );
        $deleted = $this->db->execute('DELETE FROM student_seminar_records WHERE id = ?', [$id]);
        if ($deleted > 0) {
            foreach ($certificates as $path) {
                $this->files->delete(is_string($path) ? $path : null);
            }
        }

        return $deleted;
    }
}
