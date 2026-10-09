<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

use PractiPro\Database\Database;
use PractiPro\Support\FileStorage;

/**
 * Profile pictures (user_avatars) and company logos (company_logos). The
 * images are kept in FileStorage; each row holds the image's file_path.
 */
final class MediaRepository extends Repository
{
    public function __construct(Database $db, private readonly FileStorage $files)
    {
        parent::__construct($db);
    }

    public function avatar(int $userId): ?string
    {
        return $this->read('SELECT file_path FROM user_avatars WHERE user_id = ? ORDER BY id DESC LIMIT 1', $userId);
    }

    public function replaceAvatar(int $userId, string $image): void
    {
        $this->replace('user_avatars', 'user_id', $userId, $image);
    }

    public function logo(int $companyId): ?string
    {
        return $this->read('SELECT file_path FROM company_logos WHERE company_id = ? ORDER BY id DESC LIMIT 1', $companyId);
    }

    public function replaceLogo(int $companyId, string $image): void
    {
        $this->replace('company_logos', 'company_id', $companyId, $image);
    }

    private function read(string $sql, int $ownerId): ?string
    {
        $path = $this->db->fetchValue($sql, [$ownerId]);

        return is_string($path) ? $this->files->get($path) : null;
    }

    /**
     * Swaps the owner's image for a new one and removes the old image files.
     *
     * @param 'user_avatars'|'company_logos' $table
     * @param 'user_id'|'company_id'         $ownerColumn
     */
    private function replace(string $table, string $ownerColumn, int $ownerId, string $image): void
    {
        $oldPaths = array_column($this->db->fetchAll("SELECT file_path FROM $table WHERE $ownerColumn = ?", [$ownerId]), 'file_path');
        $newPath = $this->files->put($table, $image, self::extension($image));

        try {
            $this->db->transaction(function () use ($table, $ownerColumn, $ownerId, $newPath) {
                $this->db->execute("DELETE FROM $table WHERE $ownerColumn = ?", [$ownerId]);
                $this->db->execute("INSERT INTO $table ($ownerColumn, file_path) VALUES (?, ?)", [$ownerId, $newPath]);
            });
        } catch (\Throwable $e) {
            $this->files->delete($newPath);
            throw $e;
        }

        foreach ($oldPaths as $path) {
            $this->files->delete(is_string($path) ? $path : null);
        }
    }

    private static function extension(string $image): string
    {
        $types = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp'];

        return $types[(new \finfo(FILEINFO_MIME_TYPE))->buffer($image)] ?? '';
    }
}
