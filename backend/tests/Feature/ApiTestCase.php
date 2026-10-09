<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

use PDO;
use PHPUnit\Framework\TestCase;
use PractiPro\App;
use PractiPro\Auth\Jwt;
use PractiPro\Config;
use PractiPro\Database\Database;
use PractiPro\Database\Migrator;
use PractiPro\Database\SqlFile;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\UserRepository;
use PractiPro\Support\Mailer;
use PractiPro\Tests\Support\FakeMailer;

/**
 * Base class for tests that send requests through the whole application.
 *
 * The test database is rebuilt from database/schema.sql once per run. Each
 * test runs inside a transaction that is rolled back afterwards, so tests
 * never see each other's data.
 */
abstract class ApiTestCase extends TestCase
{
    protected const PASSWORD = 'Password1';

    private static ?Database $db = null;

    protected App $app;
    protected FakeMailer $mailer;

    protected function setUp(): void
    {
        $db = self::database();
        $db->pdo()->beginTransaction();

        $config = self::config();
        $this->mailer = new FakeMailer();
        $this->app = App::create($config);
        $this->app->container()->bind(Database::class, fn () => $db);
        $this->app->container()->bind(Mailer::class, fn () => $this->mailer);
    }

    protected function tearDown(): void
    {
        if (self::database()->pdo()->inTransaction()) {
            self::database()->pdo()->rollBack();
        }
    }

    /**
     * @param array<int|string, mixed> $body
     * @param array<string, array{name: string, tmp_name: string, size: int, error: int}> $files
     */
    protected function call(string $method, string $path, array $body = [], ?string $token = null, array $files = []): Response
    {
        $headers = $token === null ? [] : ['authorization' => "Bearer $token"];

        return $this->app->handle(new Request($method, $path, $body, $headers, $files));
    }

    /**
     * Creates an active, approved account; database triggers add the role's profile row.
     */
    protected function createUser(string $role, string $email = '', string $firstName = 'Test', string $lastName = 'User'): int
    {
        $email = $email ?: $role . '.' . bin2hex(random_bytes(4)) . '@practipro.test';

        $users = $this->app->container()->get(UserRepository::class);
        $id = $users->create($firstName, $lastName, $email, password_hash(self::PASSWORD, PASSWORD_DEFAULT), $role, bin2hex(random_bytes(16)), true);
        $this->db()->execute('UPDATE user SET isActive = 1, account_activation_hash = NULL WHERE id = ?', [$id]);

        return $id;
    }

    /**
     * Puts the student in a class handled by the coordinator.
     */
    protected function assignToClass(int $studentId, int $advisorId, string $block = 'BSCS3-A'): void
    {
        $this->db()->execute('INSERT IGNORE INTO class_blocks (block_name, course, year_level) VALUES (?, ?, 3)', [$block, 'BSCS']);
        $this->db()->execute('INSERT IGNORE INTO rl_class_coordinators (coordinator_id, block_name) VALUES (?, ?)', [$advisorId, $block]);
        $this->db()->execute('UPDATE students SET block = ? WHERE id = ?', [$block, $studentId]);
    }

    /**
     * Places the student at the supervisor's company (creating one if needed).
     *
     * @return int The company id.
     */
    protected function placeAtCompany(int $studentId, int $supervisorId): int
    {
        $companyId = $this->db()->fetchValue('SELECT company_id FROM supervisors WHERE id = ?', [$supervisorId]);
        if ($companyId === null || $companyId === false) {
            $companyId = $this->db()->insert('INSERT INTO industry_partners (company_name) VALUES (?)', ['Company ' . $supervisorId]);
            $this->db()->execute('UPDATE supervisors SET company_id = ? WHERE id = ?', [$companyId, $supervisorId]);
        }
        $this->db()->execute('INSERT INTO rl_company_students (company_id, student_id, hired_by) VALUES (?, ?, ?)', [$companyId, $studentId, $supervisorId]);

        return (int) $companyId;
    }

    protected function tokenFor(int $userId): string
    {
        $user = $this->db()->fetchOne('SELECT id, firstName, lastName, email, role FROM user WHERE id = ?', [$userId]);
        self::assertNotNull($user);

        return $this->app->container()->get(Jwt::class)->encode($user);
    }

    protected function db(): Database
    {
        return self::database();
    }

    protected static function assertStatus(int $expected, Response $response, string $message = 'Unexpected status.'): void
    {
        self::assertSame($expected, $response->status(), $message . ' Body: ' . $response->body());
    }

    /**
     * @return mixed The response's "payload" field.
     */
    protected static function payload(Response $response): mixed
    {
        $decoded = $response->decoded();
        self::assertIsArray($decoded, 'Response is not JSON: ' . $response->body());

        return $decoded['payload'];
    }

    protected static function config(): Config
    {
        return new Config(
            secretKey: str_repeat('test-secret-', 4),
            frontendUrl: 'http://localhost:4200',
            dbHost: self::env('DB_HOST', 'localhost'),
            dbName: self::env('TEST_DB_NAME', 'practipro_test'),
            dbUser: self::env('DB_USER', 'root'),
            dbPassword: self::env('DB_PASSWORD', ''),
        );
    }

    private static function database(): Database
    {
        if (self::$db === null) {
            $config = self::config();
            if (!preg_match('/test/i', $config->dbName)) {
                throw new \RuntimeException("Refusing to rebuild '{$config->dbName}': the test database name must contain 'test'.");
            }

            $server = new PDO("mysql:host={$config->dbHost};charset=utf8mb4", $config->dbUser, $config->dbPassword, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            $server->exec("DROP DATABASE IF EXISTS `{$config->dbName}`");
            $server->exec("CREATE DATABASE `{$config->dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");

            self::$db = Database::connect($config);
            SqlFile::run(self::$db->pdo(), __DIR__ . '/../../database/schema.sql');
            (new Migrator(self::$db->pdo(), __DIR__ . '/../../database/migrations'))->migrate();
        }

        return self::$db;
    }

    private static function env(string $key, string $default): string
    {
        $value = $_ENV[$key] ?? getenv($key);

        return is_string($value) ? $value : $default;
    }
}
