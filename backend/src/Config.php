<?php

declare(strict_types=1);

namespace PractiPro;

/**
 * Application settings, read once from the environment (.env).
 */
final class Config
{
    public function __construct(
        public readonly string $secretKey,
        public readonly string $frontendUrl,
        public readonly string $dbHost,
        public readonly string $dbName,
        public readonly string $dbUser,
        public readonly string $dbPassword,
        public readonly bool $debug = false,
        public readonly int $tokenTtlSeconds = 8 * 60 * 60,
        public readonly string $mailHost = 'smtp.gmail.com',
        public readonly int $mailPort = 587,
        public readonly string $mailUsername = '',
        public readonly string $mailPassword = '',
        public readonly string $mailFromAddress = '',
        public readonly string $mailFromName = 'PractiPro',
        /** Where uploaded files are kept. Must not be web-accessible. */
        public readonly string $storagePath = __DIR__ . '/../storage/uploads',
    ) {
    }

    /**
     * @param array<string, string> $env
     */
    public static function fromEnv(array $env): self
    {
        return new self(
            secretKey: $env['SECRET_KEY'],
            frontendUrl: rtrim($env['FRONTEND_URL'], '/'),
            dbHost: $env['DB_HOST'],
            dbName: $env['DB_NAME'],
            dbUser: $env['DB_USER'],
            dbPassword: $env['DB_PASSWORD'] ?? '',
            debug: filter_var($env['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
            tokenTtlSeconds: (int) ($env['TOKEN_TTL_SECONDS'] ?? 8 * 60 * 60),
            mailHost: $env['MAIL_HOST'] ?? 'smtp.gmail.com',
            mailPort: (int) ($env['MAIL_PORT'] ?? 587),
            mailUsername: $env['MAIL_USERNAME'] ?? '',
            mailPassword: $env['MAIL_PASSWORD'] ?? '',
            mailFromAddress: $env['MAIL_FROM_ADDRESS'] ?? '',
            mailFromName: $env['MAIL_FROM_NAME'] ?? 'PractiPro',
            storagePath: ($env['STORAGE_PATH'] ?? '') !== '' ? $env['STORAGE_PATH'] : __DIR__ . '/../storage/uploads',
        );
    }
}
