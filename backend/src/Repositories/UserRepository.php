<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

use PractiPro\Auth\Role;

/**
 * Accounts (the `user` table) and their role-specific profile rows
 * (students, coordinators, supervisors), which share the account's id.
 */
final class UserRepository extends Repository
{
    /** Columns that are safe to send to the client: never password or token hashes. */
    private const PUBLIC_COLUMNS = 'id, firstName, lastName, email, role, isActive, approved_at';

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
        return $this->db->fetchOne('SELECT id, firstName, lastName, email, role, isActive, approved_at, password FROM user WHERE email = ?', [$email]);
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
     * Inserts the account and, for students, coordinators and supervisors,
     * the matching profile row, which shares the account's id.
     *
     * @param bool     $approved   False leaves the account waiting for an admin's approval.
     * @param int|null $approvedBy The admin creating the account, if any.
     */
    public function create(
        string $firstName,
        string $lastName,
        string $email,
        string $passwordHash,
        string $role,
        string $activationHash,
        bool $approved,
        ?int $approvedBy = null,
    ): int {
        return $this->db->transaction(function () use ($firstName, $lastName, $email, $passwordHash, $role, $activationHash, $approved, $approvedBy) {
            $id = $this->db->insert(
                'INSERT INTO user (firstName, lastName, email, password, role, account_activation_hash, approved_at, approved_by)
                 VALUES (?, ?, ?, ?, ?, ?, ' . ($approved ? 'NOW()' : 'NULL') . ', ?)',
                [$firstName, $lastName, $email, $passwordHash, $role, $activationHash, $approvedBy],
            );
            $this->ensureProfile($id, $role);

            return $id;
        });
    }

    /**
     * Profile tables per role. Each profile row has the same id as its account.
     */
    private const PROFILE_SQL = [
        Role::STUDENT => 'INSERT IGNORE INTO students (id, firstName, lastName, email) SELECT id, firstName, lastName, email FROM user WHERE id = ?',
        Role::ADVISOR => 'INSERT IGNORE INTO coordinators (id, first_name, last_name, email) SELECT id, firstName, lastName, email FROM user WHERE id = ?',
        Role::SUPERVISOR => 'INSERT IGNORE INTO supervisors (id, firstName, lastName, email) SELECT id, firstName, lastName, email FROM user WHERE id = ?',
    ];

    private const PROFILE_TABLES = [
        Role::STUDENT => 'students',
        Role::ADVISOR => 'coordinators',
        Role::SUPERVISOR => 'supervisors',
    ];

    /**
     * Creates the role's profile row if the account doesn't have one yet.
     */
    private function ensureProfile(int $id, string $role): void
    {
        if (isset(self::PROFILE_SQL[$role])) {
            $this->db->execute(self::PROFILE_SQL[$role], [$id]);
        }
    }

    private function removeProfile(int $id, string $role): void
    {
        if (isset(self::PROFILE_TABLES[$role])) {
            $this->db->execute('DELETE FROM ' . self::PROFILE_TABLES[$role] . ' WHERE id = ?', [$id]);
        }
    }

    /**
     * @return int Rows changed: 0 if the user doesn't exist or was already approved.
     */
    public function approve(int $id, int $adminId): int
    {
        return $this->db->execute(
            'UPDATE user SET approved_at = NOW(), approved_by = ? WHERE id = ? AND approved_at IS NULL',
            [$adminId, $id],
        );
    }

    public function exists(int $id): bool
    {
        return (bool) $this->db->fetchValue('SELECT COUNT(*) FROM user WHERE id = ?', [$id]);
    }

    public function roleOfActivationToken(string $tokenHash): ?string
    {
        $role = $this->db->fetchValue('SELECT role FROM user WHERE account_activation_hash = ?', [$tokenHash]);

        return $role === false ? null : (string) $role;
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

    /**
     * Changing role swaps the old role's profile row for the new one's.
     *
     * If the old profile still has records attached (a student's submissions,
     * a supervisor's hires, ...) the foreign keys refuse the delete, and the
     * whole change is rolled back rather than leaving those records orphaned.
     */
    public function update(int $id, string $role, bool $isActive): int
    {
        return $this->db->transaction(function () use ($id, $role, $isActive) {
            $previousRole = $this->roleOf($id);
            $changed = $this->db->execute('UPDATE user SET role = ?, isActive = ? WHERE id = ?', [$role, (int) $isActive, $id]);

            if ($previousRole !== null && $previousRole !== $role) {
                $this->removeProfile($id, $previousRole);
                $this->ensureProfile($id, $role);
            }

            return $changed;
        });
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
