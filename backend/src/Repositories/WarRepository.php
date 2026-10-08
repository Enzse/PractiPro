<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Weekly accomplishment reports (WAR): one record per student per week, each
 * listing the activities done that week.
 */
final class WarRepository extends Repository
{
    /**
     * @return list<array<string, mixed>>
     */
    public function records(int $studentId, ?int $week = null): array
    {
        return $week === null
            ? $this->db->fetchAll('SELECT * FROM student_war_records WHERE user_id = ?', [$studentId])
            : $this->db->fetchAll('SELECT * FROM student_war_records WHERE user_id = ? AND week = ?', [$studentId, $week]);
    }

    public function create(int $studentId, int $week): void
    {
        $this->db->execute('INSERT INTO student_war_records (user_id, week) VALUES (?, ?)', [$studentId, $week]);
    }

    public function submit(int $recordId, mixed $isSubmitted, mixed $status): void
    {
        $this->db->execute(
            'UPDATE student_war_records
             SET isSubmitted = ?, dateSubmitted = NOW(), supervisor_approval = ?, advisor_approval = ?
             WHERE id = ?',
            [$isSubmitted, $status, $status, $recordId],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function activities(int $recordId): array
    {
        return $this->db->fetchAll('SELECT * FROM student_war_activities WHERE war_id = ?', [$recordId]);
    }

    /**
     * @param array<string, mixed> $activity
     */
    public function addActivity(int $recordId, array $activity): void
    {
        $this->db->execute(
            'INSERT INTO student_war_activities (war_id, date, description, startTime, endTime) VALUES (?, ?, ?, ?, ?)',
            [$recordId, $activity['date'], $activity['description'], $activity['startTime'], $activity['endTime']],
        );
    }

    public function clearActivities(int $recordId): void
    {
        $this->db->execute('DELETE FROM student_war_activities WHERE war_id = ?', [$recordId]);
    }
}
