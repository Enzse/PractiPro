<?php

declare(strict_types=1);

namespace PractiPro\Database;

use PDO;
use PractiPro\Support\FileStorage;

/**
 * Applies database/migrations/*.sql and *.php in filename order, once each.
 *
 * A .php migration returns a function that receives the PDO connection and
 * the file storage, for changes SQL alone can't make (such as moving data
 * out of the database onto disk).
 *
 * schema.sql is the starting point; every later schema change is a new
 * migration file rather than an edit to schema.sql, so existing databases can
 * be brought up to date. Applied migrations are recorded in schema_migrations.
 */
final class Migrator
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly string $directory,
        private readonly ?FileStorage $storage = null,
    ) {
    }

    /**
     * @return list<string> The migrations that were applied by this call.
     */
    public function migrate(): array
    {
        $this->pdo->exec(
            'CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) NOT NULL PRIMARY KEY,
                applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )'
        );
        $statement = $this->pdo->prepare('SELECT version FROM schema_migrations');
        $statement->execute();
        $applied = array_map(strval(...), $statement->fetchAll(PDO::FETCH_COLUMN));

        $ran = [];
        foreach ($this->pending($applied) as $version => $path) {
            if (str_ends_with($path, '.php')) {
                $migration = require $path;
                $migration($this->pdo, $this->storage ?? throw new \LogicException("$version needs file storage."));
            } else {
                SqlFile::run($this->pdo, $path);
            }
            $this->pdo->prepare('INSERT INTO schema_migrations (version) VALUES (?)')->execute([$version]);
            $ran[] = $version;
        }

        return $ran;
    }

    /**
     * @param array<string> $applied Versions already in schema_migrations.
     * @return array<string, string> version => file path
     */
    private function pending(array $applied): array
    {
        $files = array_merge(glob($this->directory . '/*.sql') ?: [], glob($this->directory . '/*.php') ?: []);
        sort($files);

        $pending = [];
        foreach ($files as $path) {
            $version = pathinfo($path, PATHINFO_FILENAME);
            if (!in_array($version, $applied, true)) {
                $pending[$version] = $path;
            }
        }

        return $pending;
    }
}
