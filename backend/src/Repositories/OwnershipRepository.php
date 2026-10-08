<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Answers "who does this record belong to?" for authorization checks.
 */
final class OwnershipRepository extends Repository
{
    /**
     * For each table a student can own records in: SQL returning the owning
     * student's id for a record id.
     */
    private const STUDENT_OWNER_SQL = [
        'submissions' => 'SELECT user_id FROM submissions WHERE id = ?',
        'documentations' => 'SELECT user_id FROM documentations WHERE id = ?',
        'finalreports' => 'SELECT user_id FROM finalreports WHERE id = ?',
        'war' => 'SELECT user_id FROM war WHERE id = ?',
        'student_final_reports' => 'SELECT user_id FROM student_final_reports WHERE id = ?',
        'student_war_records' => 'SELECT user_id FROM student_war_records WHERE id = ?',
        'student_war_activities' => 'SELECT r.user_id FROM student_war_activities a
            JOIN student_war_records r ON r.id = a.war_id WHERE a.id = ?',
        'student_seminar_records' => 'SELECT student_id FROM student_seminar_records WHERE id = ?',
        'student_seminar_certificates' => 'SELECT r.student_id FROM student_seminar_certificates c
            JOIN student_seminar_records r ON r.id = c.record_id WHERE c.record_id = ?',
        'student_supervisor_evaluation' => 'SELECT student_id FROM student_supervisor_evaluation WHERE id = ?',
        'supervisor_student_evaluations' => 'SELECT student_id FROM supervisor_student_evaluations WHERE id = ?',
        'student_dailytimerecords' => 'SELECT student_id FROM student_dailytimerecords WHERE id = ?',
        'company_hiring_requests' => 'SELECT student_id FROM company_hiring_requests WHERE id = ?',
        'class_join_requests' => 'SELECT student_id FROM class_join_requests WHERE id = ?',
    ];

    public function studentOwnerOf(string $table, int $recordId): ?int
    {
        $sql = self::STUDENT_OWNER_SQL[$table] ?? throw new \InvalidArgumentException("No owner lookup for '$table'.");
        $owner = $this->db->fetchValue($sql, [$recordId]);

        return $owner === false || $owner === null ? null : (int) $owner;
    }

    public function advisorHasBlock(int $advisorId, string $block): bool
    {
        return (bool) $this->db->fetchValue(
            'SELECT COUNT(*) FROM rl_class_coordinators WHERE coordinator_id = ? AND block_name = ?',
            [$advisorId, $block],
        );
    }

    public function supervisorCompanyId(int $supervisorId): ?int
    {
        $companyId = $this->db->fetchValue('SELECT company_id FROM supervisors WHERE id = ?', [$supervisorId]);

        return $companyId === false || $companyId === null ? null : (int) $companyId;
    }
}
