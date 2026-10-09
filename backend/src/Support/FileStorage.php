<?php

declare(strict_types=1);

namespace PractiPro\Support;

/**
 * Stores uploaded files on disk. The database keeps only the relative path
 * returned by put().
 *
 * The storage folder must not be web-accessible (backend/.htaccess denies it):
 * files are only ever served through the API, after an access check.
 */
final class FileStorage
{
    private readonly string $root;

    public function __construct(string $root)
    {
        $this->root = rtrim(str_replace('\\', '/', $root), '/');
    }

    /**
     * Saves the contents under a new random name and returns its path, e.g.
     * "submissions/2026/10/3f9c...e1.pdf".
     *
     * @param string $folder    A short folder name, usually the table the file belongs to.
     * @param string $extension The original file's extension (cleaned before use).
     */
    public function put(string $folder, string $contents, string $extension = ''): string
    {
        $folder = preg_replace('/[^a-z0-9_]/', '', strtolower($folder)) ?: 'files';
        $extension = substr((string) preg_replace('/[^a-z0-9]/', '', strtolower($extension)), 0, 10);

        $path = sprintf('%s/%s/%s', $folder, date('Y/m'), bin2hex(random_bytes(16)) . ($extension !== '' ? ".$extension" : ''));
        $absolute = $this->absolute($path);

        if (!is_dir(dirname($absolute)) && !mkdir(dirname($absolute), 0775, true) && !is_dir(dirname($absolute))) {
            throw new \RuntimeException('Could not create the upload folder.');
        }
        if (file_put_contents($absolute, $contents, LOCK_EX) !== strlen($contents)) {
            throw new \RuntimeException('Could not save the uploaded file.');
        }

        return $path;
    }

    public function get(string $path): ?string
    {
        $absolute = $this->absolute($path);
        if (!is_file($absolute)) {
            return null;
        }
        $contents = file_get_contents($absolute);

        return $contents === false ? null : $contents;
    }

    public function delete(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }
        $absolute = $this->absolute($path);
        if (is_file($absolute)) {
            unlink($absolute);
        }
    }

    /**
     * Resolves a stored relative path, refusing anything that could escape the
     * storage folder (paths come from the database, but be strict anyway).
     */
    private function absolute(string $path): string
    {
        if (preg_match('#^[a-z0-9_]+/\d{4}/\d{2}/[a-f0-9]{32}(\.[a-z0-9]{1,10})?$#', $path) !== 1) {
            throw new \InvalidArgumentException("Invalid storage path '$path'.");
        }

        return $this->root . '/' . $path;
    }
}
