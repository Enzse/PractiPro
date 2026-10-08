<?php

declare(strict_types=1);

/*
 * Brings the database in .env up to date: php bin/migrate.php (or composer migrate).
 */

use PractiPro\Config;
use PractiPro\Database\Database;
use PractiPro\Database\Migrator;

require __DIR__ . '/../vendor/autoload.php';

Dotenv\Dotenv::createImmutable(dirname(__DIR__))->load();
$config = Config::fromEnv($_ENV);

$ran = (new Migrator(Database::connect($config)->pdo(), __DIR__ . '/../database/migrations'))->migrate();

echo $ran === []
    ? "Database '{$config->dbName}' is up to date.\n"
    : "Applied to '{$config->dbName}':\n  " . implode("\n  ", $ran) . "\n";
