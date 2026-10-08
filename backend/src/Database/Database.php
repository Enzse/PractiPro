<?php

declare(strict_types=1);

namespace PractiPro\Database;

use PDO;
use PractiPro\Config;

/**
 * Thin wrapper around PDO. Every query goes through a prepared statement, so
 * values are never concatenated into SQL.
 */
final class Database
{
    private int $savepointCounter = 0;

    public function __construct(private readonly PDO $pdo)
    {
    }

    public static function connect(Config $config): self
    {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config->dbHost, $config->dbName);

        return new self(new PDO($dsn, $config->dbUser, $config->dbPassword, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]));
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    /**
     * @param array<int|string, mixed> $params
     * @return list<array<string, mixed>>
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return array_values($statement->fetchAll());
    }

    /**
     * @param array<int|string, mixed> $params
     * @return array<string, mixed>|null
     */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);
        $row = $statement->fetch();

        return $row === false ? null : $row;
    }

    /**
     * @param array<int|string, mixed> $params
     */
    public function fetchValue(string $sql, array $params = []): mixed
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetchColumn();
    }

    /**
     * Runs an INSERT, UPDATE or DELETE.
     *
     * @param array<int|string, mixed> $params
     * @return int The number of affected rows.
     */
    public function execute(string $sql, array $params = []): int
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->rowCount();
    }

    /**
     * @param array<int|string, mixed> $params
     * @return int The new row's id.
     */
    public function insert(string $sql, array $params = []): int
    {
        $this->execute($sql, $params);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Runs the callback in a transaction: committed if it returns, rolled back if it throws.
     *
     * @template T
     * @param callable(): T $callback
     * @return T
     */
    public function transaction(callable $callback): mixed
    {
        // Inside an existing transaction, use a savepoint so a failure undoes
        // only this part.
        if ($this->pdo->inTransaction()) {
            $savepoint = 'sp_' . ++$this->savepointCounter;
            $this->pdo->exec("SAVEPOINT $savepoint");
            try {
                $result = $callback();
                $this->pdo->exec("RELEASE SAVEPOINT $savepoint");

                return $result;
            } catch (\Throwable $e) {
                $this->pdo->exec("ROLLBACK TO SAVEPOINT $savepoint");
                throw $e;
            }
        }

        $this->pdo->beginTransaction();
        try {
            $result = $callback();
            $this->pdo->commit();

            return $result;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
