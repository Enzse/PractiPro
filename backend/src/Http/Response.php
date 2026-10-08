<?php

declare(strict_types=1);

namespace PractiPro\Http;

use DateTimeImmutable;

/**
 * An HTTP response that has not been sent yet. Controllers return one of these
 * instead of echoing, so responses can be inspected in tests.
 */
final class Response
{
    /**
     * @param array<string, string> $headers
     */
    public function __construct(
        private string $body = '',
        private int $status = 200,
        private array $headers = [],
    ) {
    }

    /**
     * The API's standard JSON envelope:
     * { "status": { "remarks", "message" }, "payload", "timestamp" }.
     */
    public static function payload(mixed $data, string $message = 'Success.', int $status = 200): self
    {
        return self::json([
            'status' => [
                'remarks' => $status < 400 ? 'success' : 'failed',
                'message' => $message,
            ],
            'payload' => $data,
            'timestamp' => (new DateTimeImmutable())->format(DATE_ATOM),
        ], $status);
    }

    public static function error(string $message, int $status): self
    {
        return self::payload(null, $message, $status);
    }

    public static function json(mixed $data, int $status = 200): self
    {
        $body = json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);

        return new self($body, $status, ['Content-Type' => 'application/json; charset=utf-8']);
    }

    public static function file(string $contents, string $contentType, ?string $downloadName = null): self
    {
        $headers = ['Content-Type' => $contentType];
        if ($downloadName !== null) {
            $safeName = str_replace(['"', "\r", "\n"], '', $downloadName);
            $headers['Content-Disposition'] = 'attachment; filename="' . $safeName . '"';
        }

        return new self($contents, 200, $headers);
    }

    public static function empty(int $status = 200): self
    {
        return new self('', $status);
    }

    public function withHeader(string $name, string $value): self
    {
        $clone = clone $this;
        $clone->headers[$name] = $value;

        return $clone;
    }

    public function status(): int
    {
        return $this->status;
    }

    public function body(): string
    {
        return $this->body;
    }

    /**
     * @return array<string, string>
     */
    public function headers(): array
    {
        return $this->headers;
    }

    public function header(string $name): ?string
    {
        return $this->headers[$name] ?? null;
    }

    /**
     * Decoded JSON body, mainly for tests.
     */
    public function decoded(): mixed
    {
        return json_decode($this->body, true);
    }

    public function send(): void
    {
        http_response_code($this->status);
        foreach ($this->headers as $name => $value) {
            header($name . ': ' . $value);
        }
        echo $this->body;
    }
}
