<?php

declare(strict_types=1);

namespace PractiPro\Auth;

/**
 * The role names stored in user.role.
 */
final class Role
{
    public const SUPERADMIN = 'superadmin';
    public const ADMIN = 'admin';
    /** A practicum coordinator. Stored in the `coordinators` table. */
    public const ADVISOR = 'advisor';
    public const STUDENT = 'student';
    /** An industry partner's practicum supervisor. Stored in the `supervisors` table. */
    public const SUPERVISOR = 'supervisor';

    public const ADMINS = [self::SUPERADMIN, self::ADMIN];

    /** Roles anyone can sign up for. Admin accounts can only be created by an admin. */
    public const SELF_REGISTRABLE = [self::STUDENT, self::ADVISOR, self::SUPERVISOR];

    /** Self-registered accounts with these roles can't log in until an admin approves them. */
    public const REQUIRES_APPROVAL = [self::ADVISOR, self::SUPERVISOR];

    private function __construct()
    {
    }
}
