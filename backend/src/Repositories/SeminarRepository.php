<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Seminars students attend, each with an optional certificate file.
 */
final class SeminarRepository extends Repository
{
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
     * @param array{name: string, type: string, size: int, data: string} $file
     */
    public function attachCertificate(int $recordId, array $file): void
    {
        $this->db->transaction(function () use ($recordId, $file) {
            $this->db->execute(
                'INSERT INTO student_seminar_certificates (record_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?)',
                [$recordId, $file['name'], $file['type'], $file['size'], $file['data']],
            );
            $this->db->execute('UPDATE student_seminar_records SET certified = 1 WHERE id = ?', [$recordId]);
        });
    }

    public function delete(int $id): int
    {
        return $this->db->execute('DELETE FROM student_seminar_records WHERE id = ?', [$id]);
    }
}
