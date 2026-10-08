<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * The three ways a student gets into a class: they request to join, a
 * coordinator invites them, or they open a shareable join link.
 */
final class ClassJoinRepository extends Repository
{
    // Join requests (student -> class)

    /**
     * @return list<array<string, mixed>>
     */
    public function requestsByStudent(int $studentId): array
    {
        return $this->db->fetchAll('SELECT * FROM class_join_requests WHERE student_id = ?', [$studentId]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function requestsForBlock(string $block): array
    {
        return $this->db->fetchAll(
            'SELECT cjr.*, s.studentId, s.firstName AS studentFirstName, s.lastName AS studentLastName
             FROM class_join_requests cjr
             JOIN students s ON cjr.student_id = s.id
             WHERE cjr.class = ?',
            [$block],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function requestCountForBlock(string $block): array
    {
        return $this->db->fetchAll('SELECT COUNT(*) AS requestCount FROM class_join_requests WHERE class = ?', [$block]);
    }

    public function studentHasRequest(int $studentId): bool
    {
        return (bool) $this->db->fetchValue('SELECT COUNT(*) FROM class_join_requests WHERE student_id = ?', [$studentId]);
    }

    public function createRequest(int $studentId, string $block): void
    {
        $this->db->execute('INSERT INTO class_join_requests (student_id, class) VALUES (?, ?)', [$studentId, $block]);
    }

    public function blockOfRequest(int $requestId): ?string
    {
        $block = $this->db->fetchValue('SELECT class FROM class_join_requests WHERE id = ?', [$requestId]);

        return $block === false ? null : (string) $block;
    }

    public function deleteRequest(int $requestId): int
    {
        return $this->db->execute('DELETE FROM class_join_requests WHERE id = ?', [$requestId]);
    }

    public function deleteRequestsOfStudent(int $studentId): int
    {
        return $this->db->execute('DELETE FROM class_join_requests WHERE student_id = ?', [$studentId]);
    }

    // Invitations (coordinator -> student)

    /**
     * @return list<array<string, mixed>>
     */
    public function invitationsForStudent(int $studentId): array
    {
        return $this->db->fetchAll(
            'SELECT cji.*, c.first_name AS advisorFirstName, c.last_name AS advisorLastName
             FROM class_join_invitations cji
             JOIN coordinators c ON cji.advisor_id = c.id
             WHERE cji.student_id = ?',
            [$studentId],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function invitationCountForStudent(int $studentId): array
    {
        return $this->db->fetchAll('SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE student_id = ?', [$studentId]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function invitationsForBlock(string $block): array
    {
        return $this->db->fetchAll(
            'SELECT cji.*, s.firstName AS studentFirstName, s.lastName AS studentLastName, s.studentId
             FROM class_join_invitations cji
             JOIN students s ON cji.student_id = s.id
             WHERE cji.class = ?',
            [$block],
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function invitationCountForBlock(string $block): array
    {
        return $this->db->fetchAll('SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE class = ?', [$block]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function invitationCount(int $studentId, string $block): array
    {
        return $this->db->fetchAll(
            'SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE student_id = ? AND class = ?',
            [$studentId, $block],
        );
    }

    public function createInvitation(int $studentId, int $advisorId, string $block): void
    {
        $this->db->execute('INSERT INTO class_join_invitations (student_id, advisor_id, class) VALUES (?, ?, ?)', [$studentId, $advisorId, $block]);
    }

    public function blockOfInvitation(int $invitationId): ?string
    {
        $block = $this->db->fetchValue('SELECT class FROM class_join_invitations WHERE id = ?', [$invitationId]);

        return $block === false ? null : (string) $block;
    }

    public function deleteInvitation(int $invitationId): int
    {
        return $this->db->execute('DELETE FROM class_join_invitations WHERE id = ?', [$invitationId]);
    }

    public function deleteInvitationsOfStudent(int $studentId): int
    {
        return $this->db->execute('DELETE FROM class_join_invitations WHERE student_id = ?', [$studentId]);
    }

    // Shareable join links

    /**
     * @return array<string, mixed>|null
     */
    public function linkForBlock(string $block): ?array
    {
        return $this->db->fetchOne('SELECT * FROM class_join_links WHERE class = ?', [$block]);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function linkByToken(string $token): ?array
    {
        return $this->db->fetchOne('SELECT * FROM class_join_links WHERE join_token_hash = ?', [$token]);
    }

    public function createLink(string $block, string $token, string $expiresAt): void
    {
        $this->db->execute(
            'INSERT INTO class_join_links (class, join_token_hash, join_token_expires_at) VALUES (?, ?, ?)',
            [$block, $token, $expiresAt],
        );
    }

    public function deleteExpiredLinks(): void
    {
        $this->db->execute('DELETE FROM class_join_links WHERE join_token_expires_at < NOW()');
    }
}
