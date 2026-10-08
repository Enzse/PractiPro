<?php

declare(strict_types=1);

namespace PractiPro\Http;

use PractiPro\Auth\AuthUser;

/**
 * An incoming HTTP request. Built from PHP's superglobals in production and
 * constructed directly in tests.
 */
final class Request
{
    /** @var array<string, string> */
    private array $params = [];

    private ?AuthUser $user = null;

    /**
     * @param array<int|string, mixed> $body Decoded JSON body (an object or a list) or form fields.
     * @param array<string, string> $headers Header names are lower-cased.
     * @param array<string, array{name: string, tmp_name: string, size: int, error: int}> $files
     */
    public function __construct(
        private readonly string $method,
        private readonly string $path,
        private readonly array $body = [],
        private readonly array $headers = [],
        private readonly array $files = [],
    ) {
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        // Path relative to the front controller, so the API works whether it is
        // served from "/" or from a sub-folder such as "/PractiPro/backend/public".
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
        if ($base !== '' && str_starts_with($uri, $base)) {
            $uri = substr($uri, strlen($base));
        }

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headers[strtolower(str_replace('_', '-', substr($key, 5)))] = (string) $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['content-type'] = (string) $_SERVER['CONTENT_TYPE'];
        }
        // Apache drops the Authorization header unless .htaccess passes it through.
        if (!isset($headers['authorization']) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        $body = $_POST;
        if (str_contains($headers['content-type'] ?? '', 'application/json')) {
            $decoded = json_decode((string) file_get_contents('php://input'), true);
            $body = is_array($decoded) ? $decoded : [];
        }

        return new self($method, '/' . trim(urldecode($uri), '/'), $body, $headers, $_FILES);
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function header(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    public function bearerToken(): ?string
    {
        $header = $this->header('authorization') ?? '';
        if (preg_match('/^Bearer\s+(\S+)$/i', $header, $matches) === 1) {
            return $matches[1];
        }

        return null;
    }

    /**
     * A value captured from the route pattern, e.g. {id}.
     */
    public function param(string $name): string
    {
        if (!array_key_exists($name, $this->params)) {
            throw new \LogicException("Route parameter '$name' is not defined.");
        }

        return $this->params[$name];
    }

    public function intParam(string $name): int
    {
        $value = $this->param($name);
        if (!ctype_digit($value)) {
            throw HttpException::badRequest("'$name' must be a whole number.");
        }

        return (int) $value;
    }

    public function hasParam(string $name): bool
    {
        return array_key_exists($name, $this->params);
    }

    /**
     * @param array<string, string> $params
     */
    public function withParams(array $params): self
    {
        $clone = clone $this;
        $clone->params = $params;

        return $clone;
    }

    public function withUser(?AuthUser $user): self
    {
        $clone = clone $this;
        $clone->user = $user;

        return $clone;
    }

    /**
     * The authenticated user. Only call this on routes that require login.
     */
    public function user(): AuthUser
    {
        if ($this->user === null) {
            throw HttpException::unauthorized();
        }

        return $this->user;
    }

    public function optionalUser(): ?AuthUser
    {
        return $this->user;
    }

    /**
     * @return array<int|string, mixed>
     */
    public function all(): array
    {
        return $this->body;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    /**
     * Returns the listed body fields, failing with 422 if any are missing.
     *
     * @param list<string> $keys
     * @return array<string, mixed>
     */
    public function require(array $keys): array
    {
        $missing = array_values(array_filter($keys, fn (string $key) => !array_key_exists($key, $this->body)));
        if ($missing !== []) {
            throw HttpException::unprocessable('Missing required field(s): ' . implode(', ', $missing) . '.');
        }

        return array_intersect_key($this->body, array_flip($keys));
    }

    /**
     * Returns the listed body fields that are present, plus nulls for the rest.
     *
     * @param list<string> $keys
     * @return array<string, mixed>
     */
    public function only(array $keys): array
    {
        $values = [];
        foreach ($keys as $key) {
            $values[$key] = $this->body[$key] ?? null;
        }

        return $values;
    }

    /**
     * The uploaded file in the given form field, or a 400 if there is none.
     *
     * @return array{name: string, tmp_name: string, size: int, error: int}
     */
    public function file(string $field = 'file'): array
    {
        $file = $this->files[$field] ?? null;
        if ($file === null || $file['error'] !== UPLOAD_ERR_OK) {
            throw HttpException::badRequest('No file was uploaded.');
        }

        return $file;
    }
}
