<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$dotenv->required(['SECRET_KEY', 'DB_HOST', 'DB_NAME', 'DB_USER', 'FRONTEND_URL'])->notEmpty();
$dotenv->required('DB_PASSWORD');

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'Asia/Manila');
