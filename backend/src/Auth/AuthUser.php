<?php

declare(strict_types=1);

namespace PractiPro\Auth;

/**
 * The user making the current request, as identified by their login token.
 *
 * The database gives each role-specific row (students, coordinators,
 * supervisors) the same id as its `user` row, so `id` is also the student,
 * coordinator or supervisor id.
 */
final class AuthUser
{
    public function __construct(
        public readonly int $id,
        public readonly string $role,
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly string $email,
    ) {
    }

    /**
     * @param array<string, mixed> $claims
     */
    public static function fromClaims(array $claims): self
    {
        return new self(
            (int) $claims['id'],
            (string) $claims['role'],
            (string) ($claims['firstName'] ?? ''),
            (string) ($claims['lastName'] ?? ''),
            (string) ($claims['email'] ?? ''),
        );
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, Role::ADMINS, true);
    }

    public function is(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function fullName(): string
    {
        return trim($this->firstName . ' ' . $this->lastName);
    }
}
