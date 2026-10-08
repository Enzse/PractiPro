<?php

declare(strict_types=1);

namespace PractiPro\Database;

use PDO;

/**
 * Applies database/migrations/*.sql in filename order, once each.
 *
 * schema.sql is the starting point; every later schema change is a new
 * migration file rather than an edit to schema.sql, so existing databases can
 * be brought up to date. Applied migrations are recorded in schema_migrations.
 */
final class Migrator
{
    public function __construct(private readonly PDO $pdo, private readonly string $directory)
    {
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
            SqlFile::run($this->pdo, $path);
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
        $files = glob($this->directory . '/*.sql') ?: [];
        sort($files);

        $pending = [];
        foreach ($files as $path) {
            $version = basename($path, '.sql');
            if (!in_array($version, $applied, true)) {
                $pending[$version] = $path;
            }
        }

        return $pending;
    }
}
