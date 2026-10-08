<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Industry partners (companies), their supervisors, and how students are
 * hired into them: hiring requests, company and supervisor assignments,
 * job descriptions and work schedules.
 */
final class CompanyRepository extends Repository
{
    /**
     * Relationship tables a client may ask "does this pair already exist?"
     * about, with the columns allowed for each.
     */
    public const ASSIGNMENT_TABLES = [
        'company_hiring_requests' => ['company_id', 'student_id', 'supervisor_id'],
        'rl_company_students' => ['company_id', 'student_id', 'hired_by'],
        'rl_supervisor_students' => ['supervisor_id', 'student_id'],
    ];

    /**
     * @return list<array<string, mixed>>
     */
    public function companies(?int $id = null): array
    {
        return $id === null
            ? $this->db->fetchAll('SELECT * FROM vw_company_profile')
            : $this->db->fetchAll('SELECT * FROM vw_company_profile WHERE id = ?', [$id]);
    }

    /**
     * @param array<string, mixed> $profile
     */
    public function updateProfile(int $companyId, array $profile): void
    {
        $this->db->execute(
            'UPDATE industry_partners
             SET address = ?, company_ceo = ?, company_size = ?, industry = ?, scope_of_business = ?, it_equipment = ?
             WHERE id = ?',
            [
                $profile['address'], $profile['company_ceo'], $profile['company_size'], $profile['industry'],
                $profile['scope_of_business'], json_encode($profile['itEquipment']), $companyId,
            ],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function supervisors(?int $id = null): array
    {
        return $id === null
            ? $this->db->fetchAll('SELECT * FROM supervisors')
            : $this->db->fetchAll('SELECT * FROM supervisors WHERE id = ?', [$id]);
    }

    public function assignmentCount(string $table, string $column1, string $column2, int $id1, int $id2): int
    {
        $columns = self::ASSIGNMENT_TABLES[$table] ?? throw new \InvalidArgumentException("Unknown table '$table'.");
        if (!in_array($column1, $columns, true) || !in_array($column2, $columns, true)) {
            throw new \InvalidArgumentException("Unknown column for '$table'.");
        }

        return (int) $this->db->fetchValue("SELECT COUNT(*) FROM $table WHERE $column1 = ? AND $column2 = ?", [$id1, $id2]);
    }

    // Hiring requests: a supervisor offers a student a place; the student accepts or declines.

    /**
     * @return list<array<string, mixed>>
     */
    public function hiringRequestsForStudent(int $studentId): array
    {
        return $this->db->fetchAll(
            'SELECT hr.*, ip.company_name, s.firstName AS sFirstName, s.lastName AS sLastName
             FROM company_hiring_requests hr
             JOIN industry_partners ip ON hr.company_id = ip.id
             JOIN supervisors s ON hr.supervisor_id = s.id
             WHERE hr.student_id = ?',
            [$studentId],
        );
    }

    public function createHiringRequest(int $companyId, int $studentId, int $supervisorId): void
    {
        $this->db->execute(
            'INSERT INTO company_hiring_requests (company_id, student_id, supervisor_id) VALUES (?, ?, ?)',
            [$companyId, $studentId, $supervisorId],
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    public function hiringRequest(int $id): ?array
    {
        return $this->db->fetchOne('SELECT * FROM company_hiring_requests WHERE id = ?', [$id]);
    }

    public function deleteHiringRequest(int $id): int
    {
        return $this->db->execute('DELETE FROM company_hiring_requests WHERE id = ?', [$id]);
    }

    // Company and supervisor assignments

    public function addStudentToCompany(int $companyId, int $studentId, int $hiredBy): void
    {
        $this->db->execute(
            'INSERT INTO rl_company_students (company_id, student_id, hired_by) VALUES (?, ?, ?)',
            [$companyId, $studentId, $hiredBy],
        );
    }

    public function removeStudentFromCompany(int $companyId, int $studentId): int
    {
        return $this->db->execute('DELETE FROM rl_company_students WHERE company_id = ? AND student_id = ?', [$companyId, $studentId]);
    }

    public function addStudentToSupervisor(int $supervisorId, int $studentId): void
    {
        $this->db->execute('INSERT INTO rl_supervisor_students (supervisor_id, student_id) VALUES (?, ?)', [$supervisorId, $studentId]);
    }

    public function removeStudentFromSupervisors(int $studentId, ?int $supervisorId = null): int
    {
        return $supervisorId === null
            ? $this->db->execute('DELETE FROM rl_supervisor_students WHERE student_id = ?', [$studentId])
            : $this->db->execute('DELETE FROM rl_supervisor_students WHERE student_id = ? AND supervisor_id = ?', [$studentId, $supervisorId]);
    }

    // Jobs and schedules

    /**
     * @return list<array<string, mixed>>
     */
    public function jobOf(int $studentId): array
    {
        return $this->db->fetchAll(
            'SELECT sj.*, s.firstName AS sfirstName, s.lastName AS slastName
             FROM student_jobs sj
             JOIN supervisors s ON sj.assigned_by = s.id
             WHERE sj.student_id = ?',
            [$studentId],
        );
    }

    /**
     * @param array<string, mixed> $job
     */
    public function assignJob(int $studentId, int $supervisorId, array $job): void
    {
        $this->db->execute(
            'INSERT INTO student_jobs (student_id, assigned_by, job_title, job_description, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
            [$studentId, $supervisorId, $job['job_title'], $job['job_description'], $job['start_date'], $job['end_date']],
        );
    }

    public function unassignJob(int $studentId): int
    {
        return $this->db->execute('DELETE FROM student_jobs WHERE student_id = ?', [$studentId]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function schedulesOf(int $studentId): array
    {
        return $this->db->fetchAll('SELECT * FROM student_ojt_schedules WHERE student_id = ?', [$studentId]);
    }

    /**
     * @param list<array<string, mixed>> $schedules
     */
    public function replaceSchedules(int $studentId, array $schedules): void
    {
        $this->db->transaction(function () use ($studentId, $schedules) {
            $this->clearSchedules($studentId);
            foreach ($schedules as $schedule) {
                $this->db->execute(
                    'INSERT INTO student_ojt_schedules (student_id, day_of_week, start_time, end_time, has_work) VALUES (?, ?, ?, ?, ?)',
                    [$studentId, $schedule['day_of_week'], $schedule['start_time'], $schedule['end_time'], $schedule['has_work']],
                );
            }
        });
    }

    public function clearSchedules(int $studentId): int
    {
        return $this->db->execute('DELETE FROM student_ojt_schedules WHERE student_id = ?', [$studentId]);
    }
}
