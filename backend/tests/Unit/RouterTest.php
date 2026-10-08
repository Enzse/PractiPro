<?php

declare(strict_types=1);

namespace PractiPro\Tests\Unit;

use PHPUnit\Framework\TestCase;
use PractiPro\Auth\AuthUser;
use PractiPro\Http\HttpException;
use PractiPro\Http\Router;

final class RouterTest extends TestCase
{
    public function testCapturesNamedParameters(): void
    {
        $router = new Router();
        $router->get('/student/{id:\d+}/week/{week}', [self::class, 'handler']);

        [$route, $params] = $router->match('GET', '/student/42/week/3');

        self::assertSame('/student/{id:\d+}/week/{week}', $route->pattern);
        self::assertSame(['id' => '42', 'week' => '3'], $params);
    }

    public function testParameterPatternsMustMatch(): void
    {
        $router = new Router();
        $router->get('/student/{id:\d+}', [self::class, 'handler']);

        $this->expectExceptionObject(HttpException::notFound('Endpoint not found.'));
        $router->match('GET', '/student/abc');
    }

    public function testUnknownPathIs404(): void
    {
        $this->expectExceptionCode(404);
        (new Router())->match('GET', '/nope');
    }

    public function testWrongMethodIs405(): void
    {
        $router = new Router();
        $router->post('/login', [self::class, 'handler']);

        $this->expectExceptionCode(405);
        $router->match('GET', '/login');
    }

    public function testRoutesRequireLoginByDefault(): void
    {
        $route = (new Router())->get('/x', [self::class, 'handler']);

        self::assertFalse($route->isPublic());
        self::assertTrue($route->allows(self::user('student')));
    }

    public function testRolesRestrictAccessButAdminsAlwaysPass(): void
    {
        $route = (new Router())->get('/x', [self::class, 'handler'])->roles('advisor');

        self::assertTrue($route->allows(self::user('advisor')));
        self::assertFalse($route->allows(self::user('student')));
        self::assertTrue($route->allows(self::user('admin')));
        self::assertTrue($route->allows(self::user('superadmin')));
    }

    private static function user(string $role): AuthUser
    {
        return new AuthUser(1, $role, 'A', 'B', 'a@b.c');
    }
}
