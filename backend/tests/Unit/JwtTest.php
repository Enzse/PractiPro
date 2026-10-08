<?php

declare(strict_types=1);

namespace PractiPro\Tests\Unit;

use PHPUnit\Framework\TestCase;
use PractiPro\Auth\InvalidTokenException;
use PractiPro\Auth\Jwt;

final class JwtTest extends TestCase
{
    private const KEY = 'a-test-secret-that-is-long-enough!!';

    public function testDecodesWhatItEncodes(): void
    {
        $jwt = new Jwt(self::KEY);

        $claims = $jwt->decode($jwt->encode(['id' => 7, 'role' => 'student']));

        self::assertSame(7, $claims['id']);
        self::assertSame('student', $claims['role']);
    }

    public function testAddsIssuedAtAndExpiry(): void
    {
        $jwt = new Jwt(self::KEY, ttlSeconds: 3600, clock: fn () => 1_000_000);

        $claims = $jwt->decode($jwt->encode(['id' => 1]));

        self::assertSame(1_000_000, $claims['iat']);
        self::assertSame(1_003_600, $claims['exp']);
    }

    public function testRejectsExpiredTokens(): void
    {
        $now = 1_000_000;
        $jwt = new Jwt(self::KEY, ttlSeconds: 60, clock: function () use (&$now) {
            return $now;
        });
        $token = $jwt->encode(['id' => 1]);

        $now += 61;

        $this->expectException(InvalidTokenException::class);
        $jwt->decode($token);
    }

    public function testRejectsAModifiedPayload(): void
    {
        $jwt = new Jwt(self::KEY);
        [$header, , $signature] = explode('.', $jwt->encode(['id' => 1, 'role' => 'student']));
        $forgedPayload = rtrim(strtr(base64_encode((string) json_encode(['id' => 1, 'role' => 'admin', 'exp' => time() + 999])), '+/', '-_'), '=');

        $this->expectException(InvalidTokenException::class);
        $jwt->decode("$header.$forgedPayload.$signature");
    }

    public function testRejectsTokensSignedWithAnotherKey(): void
    {
        $token = (new Jwt(str_repeat('x', 32)))->encode(['id' => 1]);

        $this->expectException(InvalidTokenException::class);
        (new Jwt(self::KEY))->decode($token);
    }

    public function testRejectsUnsignedTokens(): void
    {
        $header = rtrim(strtr(base64_encode('{"alg":"none","typ":"JWT"}'), '+/', '-_'), '=');
        $payload = rtrim(strtr(base64_encode((string) json_encode(['id' => 1, 'exp' => time() + 999])), '+/', '-_'), '=');

        $this->expectException(InvalidTokenException::class);
        (new Jwt(self::KEY))->decode("$header.$payload.");
    }

    public function testRejectsMalformedTokens(): void
    {
        $this->expectException(InvalidTokenException::class);
        (new Jwt(self::KEY))->decode('not-a-token');
    }

    public function testRequiresAReasonablyLongKey(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Jwt('short');
    }
}
