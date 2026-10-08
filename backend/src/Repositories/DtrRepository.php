<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Daily time records: students clock in and out each day they work.
 */
final class DtrRepository extends Repository
{
    /** Records shorter than this are discarded on clock-out. */
    public const MINIMUM_HOURS = 1.0;

    /**
     * @return list<array<string, mixed>>
     */
    public function records(?int $studentId = null): array
    {
        return $studentId === null
            ? $this->db->fetchAll('SELECT * FROM student_dailytimerecords')
            : $this->db->fetchAll('SELECT * FROM student_dailytimerecords WHERE student_id = ?', [$studentId]);
    }

    public function hasOpenRecordToday(int $studentId): bool
    {
        return (bool) $this->db->fetchValue(
            'SELECT COUNT(*) FROM student_dailytimerecords WHERE student_id = ? AND date = CURDATE() AND endTime IS NULL',
            [$studentId],
        );
    }

    public function clockIn(int $studentId): void
    {
        $this->db->execute('INSERT INTO student_dailytimerecords (student_id, date, startTime) VALUES (?, CURDATE(), CURTIME())', [$studentId]);
    }

    public function clockOut(int $studentId): int
    {
        return $this->db->execute(
            "UPDATE student_dailytimerecords SET endTime = CURTIME(), status = 'Pending'
             WHERE student_id = ? AND date = CURDATE() AND endTime IS NULL",
            [$studentId],
        );
    }

    public function deleteShortRecords(int $studentId): int
    {
        return $this->db->execute(
            'DELETE FROM student_dailytimerecords WHERE student_id = ? AND totalHours >= 0 AND totalHours < ?',
            [$studentId, self::MINIMUM_HOURS],
        );
    }

    public function setStatus(int $id, string $status): int
    {
        return $this->db->execute('UPDATE student_dailytimerecords SET status = ? WHERE id = ?', [$status, $id]);
    }
}
