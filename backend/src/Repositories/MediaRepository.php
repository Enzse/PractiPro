<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Profile pictures (user_avatars) and company logos (company_logos).
 */
final class MediaRepository extends Repository
{
    public function avatar(int $userId): ?string
    {
        $data = $this->db->fetchValue('SELECT avatar FROM user_avatars WHERE user_id = ? ORDER BY id DESC LIMIT 1', [$userId]);

        return $data === false || $data === null ? null : (string) $data;
    }

    public function replaceAvatar(int $userId, string $image): void
    {
        $this->db->transaction(function () use ($userId, $image) {
            $this->db->execute('DELETE FROM user_avatars WHERE user_id = ?', [$userId]);
            $this->db->execute('INSERT INTO user_avatars (user_id, avatar) VALUES (?, ?)', [$userId, $image]);
        });
    }

    public function logo(int $companyId): ?string
    {
        $data = $this->db->fetchValue('SELECT avatar FROM company_logos WHERE company_id = ? ORDER BY id DESC LIMIT 1', [$companyId]);

        return $data === false || $data === null ? null : (string) $data;
    }

    public function replaceLogo(int $companyId, string $image): void
    {
        $this->db->transaction(function () use ($companyId, $image) {
            $this->db->execute('DELETE FROM company_logos WHERE company_id = ?', [$companyId]);
            $this->db->execute('INSERT INTO company_logos (company_id, avatar) VALUES (?, ?)', [$companyId, $image]);
        });
    }
}
