<?php

declare(strict_types=1);

namespace PractiPro\Support;

use PractiPro\Http\HttpException;

final class Passwords
{
    /**
     * Same rule as the frontend's passwordStrengthValidator: at least 8
     * characters with a lower-case letter, an upper-case letter and a digit.
     */
    public static function assertStrong(mixed $password): string
    {
        if (!is_string($password) || strlen($password) < 8 || preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $password) !== 1) {
            throw HttpException::unprocessable('Password must be at least 8 characters and include upper-case, lower-case and a number.');
        }

        return $password;
    }

    /**
     * A random token for links sent by email, and the hash stored in the database.
     *
     * @return array{0: string, 1: string} [token, hash]
     */
    public static function newToken(): array
    {
        $token = bin2hex(random_bytes(16));

        return [$token, hash('sha256', $token)];
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
