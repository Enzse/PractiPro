<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

final class StudentRepository extends Repository
{
    private const COLUMNS = 'id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth';

    /** Columns of vw_student_pending_submissions that clients may filter on. */
    public const PENDING_COLUMNS = [
        'pending_req_count',
        'pending_doc_count',
        'pending_sem_count',
        'pending_war_count_advisor',
        'pending_war_count_supervisor',
        'pending_frp_count',
        'pending_sse_count',
    ];

    /**
     * @return list<array<string, mixed>>
     */
    public function all(): array
    {
        return $this->db->fetchAll('SELECT ' . self::COLUMNS . ' FROM students');
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function find(int $id): array
    {
        return $this->db->fetchAll('SELECT ' . self::COLUMNS . ' FROM students WHERE id = ?', [$id]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function byCourseAndYear(string $program, int $year): array
    {
        return $this->db->fetchAll('SELECT ' . self::COLUMNS . ' FROM students WHERE program = ? AND year = ?', [$program, $year]);
    }

    /**
     * Students with their practicum progress (hours, company, class).
     *
     * @return list<array<string, mixed>>
     */
    public function ojtStatus(?int $id = null): array
    {
        return $id === null
            ? $this->db->fetchAll('SELECT * FROM vw_student_ojt_status')
            : $this->db->fetchAll('SELECT * FROM vw_student_ojt_status WHERE id = ?', [$id]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function ojtStatusByBlock(string $block): array
    {
        return $this->db->fetchAll('SELECT * FROM vw_student_ojt_status WHERE block = ?', [$block]);
    }

    /**
     * Lookup by the school-issued student number, used when inviting or hiring.
     *
     * @return list<array<string, mixed>>
     */
    public function byStudentNumber(string $studentNumber): array
    {
        return $this->db->fetchAll(
            'SELECT v.*, ip.company_name, ip.address AS company_address
             FROM vw_student_ojt_status v
             LEFT JOIN industry_partners ip ON v.company_id = ip.id
             WHERE v.studentId = ?',
            [$studentNumber],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function byCompany(int $companyId): array
    {
        return $this->db->fetchAll(
            'SELECT v.*, s.firstName AS sFirstName, s.lastName AS sLastName
             FROM vw_student_ojt_status v
             JOIN rl_company_students cs ON v.id = cs.student_id
             JOIN supervisors s ON cs.hired_by = s.id
             WHERE v.company_id = ?',
            [$companyId],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function bySupervisor(int $supervisorId): array
    {
        return $this->db->fetchAll(
            'SELECT v.*
             FROM vw_student_ojt_status v
             JOIN rl_supervisor_students r ON v.id = r.student_id
             WHERE r.supervisor_id = ?',
            [$supervisorId],
        );
    }

    /**
     * @param array<string, mixed> $profile
     */
    public function updateProfile(int $id, array $profile): void
    {
        $this->db->execute(
            'UPDATE students SET firstName = ?, lastName = ?, studentId = ?, program = ?, year = ?,
                phoneNumber = ?, address = ?, dateOfBirth = ?
             WHERE id = ?',
            [
                $profile['firstName'], $profile['lastName'], $profile['studentId'], $profile['program'], $profile['year'],
                $profile['phoneNumber'], $profile['address'], $profile['dateOfBirth'], $id,
            ],
        );
    }

    public function assignBlock(int $id, string $block): void
    {
        $this->db->execute('UPDATE students SET block = ? WHERE id = ?', [$block, $id]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function requirements(?int $studentId = null): array
    {
        return $studentId === null
            ? $this->db->fetchAll('SELECT * FROM vw_student_requirements')
            : $this->db->fetchAll('SELECT * FROM vw_student_requirements WHERE student_id = ?', [$studentId]);
    }

    /**
     * Pending-submission counts for one student. With a column, returns only
     * that count, and only if it is above zero.
     *
     * @return list<array<string, mixed>>
     */
    public function pendingSubmissions(int $studentId, ?string $column = null): array
    {
        if ($column === null) {
            return $this->db->fetchAll('SELECT * FROM vw_student_pending_submissions WHERE student_id = ?', [$studentId]);
        }
        $column = self::pendingColumn($column);

        return $this->db->fetchAll("SELECT $column FROM vw_student_pending_submissions WHERE student_id = ? AND $column > 0", [$studentId]);
    }

    /**
     * Students in a class with at least one pending submission of the given kind.
     *
     * @return list<array<string, mixed>>
     */
    public function withPendingSubmissions(string $block, string $column): array
    {
        $column = self::pendingColumn($column);

        return $this->db->fetchAll(
            "SELECT ojt.id, ojt.studentId, ojt.firstName, ojt.lastName, ojt.TotalHoursWorked, ojt.TotalSeminarHours,
                    pending.$column AS pendingSubmissions
             FROM vw_student_ojt_status ojt
             JOIN vw_student_pending_submissions pending ON ojt.id = pending.student_id
             WHERE pending.$column > 0 AND ojt.block = ?",
            [$block],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function pendingSubmissionsByBlock(string $block): array
    {
        return $this->db->fetchAll('SELECT * FROM vw_student_pending_submissions WHERE block = ?', [$block]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function pendingSubmissionTotals(string $block): array
    {
        return $this->db->fetchAll('SELECT * FROM vw_block_pending_submissions WHERE block_name = ?', [$block]);
    }

    private static function pendingColumn(string $column): string
    {
        if (!in_array($column, self::PENDING_COLUMNS, true)) {
            throw new \InvalidArgumentException("Unknown pending-submission column '$column'.");
        }

        return $column;
    }
}
