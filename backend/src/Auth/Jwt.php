<?php

declare(strict_types=1);

namespace PractiPro\Auth;

/**
 * Minimal JSON Web Token (HS256) encoder and verifier.
 *
 * A token is three base64url parts joined by dots: header.payload.signature.
 * The signature is an HMAC of "header.payload" using the server's secret key,
 * so the server can detect any change to the payload. The payload itself is
 * only encoded, not encrypted: never put secrets in it.
 */
final class Jwt
{
    private const ALGORITHM = 'HS256';

    /**
     * @param int $ttlSeconds How long a token stays valid after it is issued.
     */
    public function __construct(
        private readonly string $key,
        private readonly int $ttlSeconds = 8 * 60 * 60,
        private readonly ?\Closure $clock = null,
    ) {
        if (strlen($key) < 32) {
            throw new \InvalidArgumentException('The JWT secret key must be at least 32 characters.');
        }
    }

    /**
     * @param array<string, mixed> $claims
     */
    public function encode(array $claims): string
    {
        $now = $this->now();
        $claims['iat'] = $now;
        $claims['exp'] = $now + $this->ttlSeconds;

        $header = self::base64UrlEncode(json_encode(['alg' => self::ALGORITHM, 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $payload = self::base64UrlEncode(json_encode($claims, JSON_THROW_ON_ERROR));

        return $header . '.' . $payload . '.' . $this->sign($header . '.' . $payload);
    }

    /**
     * @return array<string, mixed> The token's claims.
     *
     * @throws InvalidTokenException If the token is malformed, tampered with or expired.
     */
    public function decode(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new InvalidTokenException('Malformed token.');
        }
        [$header, $payload, $signature] = $parts;

        // Compare in constant time so the response time doesn't leak how much of the signature matched.
        if (!hash_equals($this->sign($header . '.' . $payload), $signature)) {
            throw new InvalidTokenException('Invalid token signature.');
        }

        $headerData = json_decode(self::base64UrlDecode($header), true);
        if (!is_array($headerData) || ($headerData['alg'] ?? null) !== self::ALGORITHM) {
            throw new InvalidTokenException('Unsupported token algorithm.');
        }

        $claims = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($claims)) {
            throw new InvalidTokenException('Malformed token payload.');
        }
        if (!isset($claims['exp']) || !is_int($claims['exp']) || $claims['exp'] <= $this->now()) {
            throw new InvalidTokenException('Token has expired.');
        }

        return $claims;
    }

    private function sign(string $data): string
    {
        return self::base64UrlEncode(hash_hmac('sha256', $data, $this->key, true));
    }

    private function now(): int
    {
        return $this->clock !== null ? ($this->clock)() : time();
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }
}
