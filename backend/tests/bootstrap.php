<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

// Database credentials come from .env when present (local XAMPP), otherwise
// from real environment variables (CI). The database name is always the test one.
if (is_file(__DIR__ . '/../.env')) {
    Dotenv\Dotenv::createImmutable(dirname(__DIR__))->safeLoad();
}

date_default_timezone_set('Asia/Manila');
