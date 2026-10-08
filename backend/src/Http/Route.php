<?php

declare(strict_types=1);

namespace PractiPro\Http;

use PractiPro\Auth\AuthUser;

/**
 * One entry in the route table: an HTTP method and path pattern, the controller
 * method that handles it, and who may call it.
 *
 * Routes require a logged-in user by default ("secure by default"). Call
 * public() to open one up, or roles() to restrict it further. Administrators
 * may call every non-public route.
 */
final class Route
{
    private bool $public = false;

    /** @var list<string> Empty means any authenticated user. */
    private array $roles = [];

    private string $regex;

    /**
     * @param array{0: class-string, 1: string} $handler
     */
    public function __construct(
        public readonly string $method,
        public readonly string $pattern,
        public readonly array $handler,
    ) {
        $this->regex = self::compile($pattern);
    }

    public function public(): self
    {
        $this->public = true;

        return $this;
    }

    public function roles(string ...$roles): self
    {
        $this->roles = array_values($roles);

        return $this;
    }

    public function isPublic(): bool
    {
        return $this->public;
    }

    public function allows(AuthUser $user): bool
    {
        return $user->isAdmin() || $this->roles === [] || in_array($user->role, $this->roles, true);
    }

    /**
     * @return array<string, string>|null Captured parameters, or null if the path does not match.
     */
    public function match(string $path): ?array
    {
        if (preg_match($this->regex, $path, $matches) !== 1) {
            return null;
        }

        return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
    }

    /**
     * Turns "/student/{id:\d+}" into "#^/student/(?P<id>\d+)$#".
     * A placeholder without a pattern matches any single path segment.
     */
    private static function compile(string $pattern): string
    {
        $regex = preg_replace_callback(
            '/\{(\w+)(?::([^}]+))?\}/',
            fn (array $m) => '(?P<' . $m[1] . '>' . ($m[2] ?? '[^/]+') . ')',
            $pattern,
        );

        return '#^' . $regex . '$#';
    }
}
