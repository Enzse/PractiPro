<?php

declare(strict_types=1);

/*
 * Front controller: every API request is routed here by .htaccess.
 */

use PractiPro\App;
use PractiPro\Config;
use PractiPro\Http\Request;

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();
$dotenv->required(['SECRET_KEY', 'FRONTEND_URL', 'DB_HOST', 'DB_NAME', 'DB_USER'])->notEmpty();
$dotenv->required('DB_PASSWORD');

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'Asia/Manila');

// Turn PHP warnings and notices into exceptions so they can't silently corrupt a response.
set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

App::create(Config::fromEnv($_ENV))
    ->handle(Request::fromGlobals())
    ->send();
