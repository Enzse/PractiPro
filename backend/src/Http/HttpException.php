<?php

declare(strict_types=1);

namespace PractiPro\Http;

use RuntimeException;

/**
 * An error that maps directly to an HTTP response. Throw it from anywhere in a
 * request; the App turns it into a JSON error with the given status code.
 */
class HttpException extends RuntimeException
{
    public function __construct(private readonly int $status, string $message)
    {
        parent::__construct($message, $status);
    }

    public function status(): int
    {
        return $this->status;
    }

    public static function badRequest(string $message = 'Bad request.'): self
    {
        return new self(400, $message);
    }

    public static function unauthorized(string $message = 'Authentication required.'): self
    {
        return new self(401, $message);
    }

    public static function forbidden(string $message = 'You do not have access to this resource.'): self
    {
        return new self(403, $message);
    }

    public static function notFound(string $message = 'Not found.'): self
    {
        return new self(404, $message);
    }

    public static function conflict(string $message): self
    {
        return new self(409, $message);
    }

    public static function unprocessable(string $message): self
    {
        return new self(422, $message);
    }
}
