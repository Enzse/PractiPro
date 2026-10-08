<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Accounts (the `user` table) and the role-specific profile rows that the
 * database triggers create alongside them.
 */
final class UserRepository extends Repository
{
    /** Columns that are safe to send to the client: never password or token hashes. */
    private const PUBLIC_COLUMNS = 'id, firstName, lastName, email, role, isActive';

    /**
     * @return list<array<string, mixed>>
     */
    public function all(): array
    {
        return $this->db->fetchAll('SELECT ' . self::PUBLIC_COLUMNS . ' FROM user ORDER BY id');
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function find(int $id): array
    {
        return $this->db->fetchAll('SELECT ' . self::PUBLIC_COLUMNS . ' FROM user WHERE id = ?', [$id]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function withRole(string $role): array
    {
        return $this->db->fetchAll('SELECT ' . self::PUBLIC_COLUMNS . ' FROM user WHERE role = ? ORDER BY id', [$role]);
    }

    /**
     * Includes the password hash: for login only, never return it to the client.
     *
     * @return array<string, mixed>|null
     */
    public function findForLogin(string $email): ?array
    {
        return $this->db->fetchOne('SELECT id, firstName, lastName, email, role, isActive, password FROM user WHERE email = ?', [$email]);
    }

    public function roleOf(int $id): ?string
    {
        $role = $this->db->fetchValue('SELECT role FROM user WHERE id = ?', [$id]);

        return $role === false ? null : (string) $role;
    }

    public function emailExists(string $email): bool
    {
        return (bool) $this->db->fetchValue('SELECT COUNT(*) FROM user WHERE email = ?', [$email]);
    }

    /**
     * Inserts the account. Database triggers then create the matching
     * students / coordinators / supervisors row with the same id.
     */
    public function create(string $firstName, string $lastName, string $email, string $passwordHash, string $role, string $activationHash): int
    {
        return $this->db->insert(
            'INSERT INTO user (firstName, lastName, email, password, role, account_activation_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [$firstName, $lastName, $email, $passwordHash, $role, $activationHash],
        );
    }

    public function completeStudentProfile(string $email, string $studentId, string $program, int $year): void
    {
        $this->db->execute('UPDATE students SET studentId = ?, program = ?, year = ? WHERE email = ?', [$studentId, $program, $year, $email]);
    }

    public function studentIdTaken(string $studentId): bool
    {
        return (bool) $this->db->fetchValue('SELECT COUNT(*) FROM students WHERE studentId = ?', [$studentId]);
    }

    public function completeAdvisorProfile(string $email, string $department): void
    {
        $this->db->execute('UPDATE coordinators SET department = ? WHERE email = ?', [$department, $email]);
    }

    public function completeSupervisorProfile(string $email, string $companyName, ?string $companyAddress, ?string $position, ?string $phone): void
    {
        $companyId = $this->db->fetchValue('SELECT id FROM industry_partners WHERE company_name = ?', [$companyName]);
        if ($companyId === false) {
            $companyId = $this->db->insert('INSERT INTO industry_partners (company_name, address) VALUES (?, ?)', [$companyName, $companyAddress]);
        }

        $this->db->execute(
            'UPDATE supervisors SET company_id = ?, position = ?, phone = ? WHERE email = ?',
            [$companyId, $position, $phone, $email],
        );
    }

    public function update(int $id, string $role, bool $isActive): int
    {
        return $this->db->execute('UPDATE user SET role = ?, isActive = ? WHERE id = ?', [$role, (int) $isActive, $id]);
    }

    public function delete(int $id): int
    {
        return $this->db->execute('DELETE FROM user WHERE id = ?', [$id]);
    }

    // Account activation and password reset. Only SHA-256 hashes of tokens are
    // stored, so a leaked database can't be used to take over accounts.

    public function hasActivationToken(string $tokenHash): bool
    {
        return (bool) $this->db->fetchValue('SELECT COUNT(*) FROM user WHERE account_activation_hash = ?', [$tokenHash]);
    }

    public function activate(string $tokenHash): int
    {
        return $this->db->execute('UPDATE user SET isActive = 1, account_activation_hash = NULL WHERE account_activation_hash = ?', [$tokenHash]);
    }

    public function setResetToken(string $email, string $tokenHash, string $expiresAt): void
    {
        $this->db->execute('UPDATE user SET reset_token_hash = ?, reset_token_expires_at = ? WHERE email = ?', [$tokenHash, $expiresAt, $email]);
    }

    public function resetTokenExpiry(string $tokenHash): ?string
    {
        $expiry = $this->db->fetchValue('SELECT reset_token_expires_at FROM user WHERE reset_token_hash = ?', [$tokenHash]);

        return $expiry === false ? null : (string) $expiry;
    }

    public function resetPassword(string $tokenHash, string $passwordHash): int
    {
        return $this->db->execute(
            'UPDATE user SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
             WHERE reset_token_hash = ? AND reset_token_expires_at > NOW()',
            [$passwordHash, $tokenHash],
        );
    }
}
