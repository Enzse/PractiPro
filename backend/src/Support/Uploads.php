<?php

declare(strict_types=1);

namespace PractiPro\Support;

use PractiPro\Http\HttpException;

/**
 * Reads and validates uploaded files. Files are currently stored in the
 * database (MEDIUMBLOB columns, max 16 MB).
 */
final class Uploads
{
    private const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
    private const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    /**
     * @param array{name: string, tmp_name: string, size: int, error: int} $file
     * @return array{name: string, type: string, size: int, data: string}
     */
    public static function document(array $file): array
    {
        if ($file['size'] > self::MAX_DOCUMENT_BYTES) {
            throw HttpException::unprocessable('Files must be 15 MB or smaller.');
        }
        $name = basename($file['name']);

        return [
            'name' => $name,
            'type' => strtolower(pathinfo($name, PATHINFO_EXTENSION)),
            'size' => $file['size'],
            'data' => (string) file_get_contents($file['tmp_name']),
        ];
    }

    /**
     * @param array{name: string, tmp_name: string, size: int, error: int} $file
     */
    public static function image(array $file): string
    {
        if ($file['size'] > self::MAX_IMAGE_BYTES) {
            throw HttpException::unprocessable('Images must be 5 MB or smaller.');
        }
        $data = (string) file_get_contents($file['tmp_name']);
        if (!str_starts_with(self::mimeType($data), 'image/')) {
            throw HttpException::unprocessable('Please upload an image file.');
        }

        return $data;
    }

    /**
     * Detects a file's type from its contents rather than trusting its name.
     */
    public static function mimeType(string $data): string
    {
        return (new \finfo(FILEINFO_MIME_TYPE))->buffer($data) ?: 'application/octet-stream';
    }
}
