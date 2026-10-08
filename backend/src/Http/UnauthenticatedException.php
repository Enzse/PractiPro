<?php

declare(strict_types=1);

namespace PractiPro\Http;

/**
 * The request has no valid login token. Responses for this error carry a
 * "WWW-Authenticate: Bearer" header, which is how the frontend tells "log in
 * again" apart from other 401s such as an expired join link.
 */
final class UnauthenticatedException extends HttpException
{
    public function __construct(string $message = 'Authentication required.')
    {
        parent::__construct(401, $message);
    }
}
