<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Role;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\OwnershipRepository;

/**
 * Shared helpers for controllers.
 *
 * Route roles (routes/api.php) decide *which kinds* of users can call an
 * endpoint. The authorize* methods here decide whether *this* user may touch
 * *this* record, e.g. a student may only read their own time records.
 */
abstract class Controller
{
    public function __construct(protected readonly OwnershipRepository $ownership)
    {
    }

    protected function ok(mixed $data, string $message = 'Successfully retrieved data.'): Response
    {
        return Response::payload($data, $message);
    }

    protected function done(string $message, mixed $data = null): Response
    {
        return Response::payload($data, $message);
    }

    /**
     * Only people responsible for a student may access their records: the
     * student themselves, the coordinator of their class, a supervisor at the
     * company they are placed in, and admins.
     */
    protected function authorizeStudent(Request $request, int $studentId): void
    {
        if (!$this->canAccessStudent($request, $studentId)) {
            throw HttpException::forbidden();
        }
    }

    protected function canAccessStudent(Request $request, int $studentId): bool
    {
        $user = $request->user();

        return match (true) {
            $user->isAdmin() => true,
            $user->is(Role::STUDENT) => $user->id === $studentId,
            $user->is(Role::ADVISOR) => $this->ownership->advisorHasStudent($user->id, $studentId),
            $user->is(Role::SUPERVISOR) => $this->ownership->supervisorHasStudent($user->id, $studentId),
            default => false,
        };
    }

    /**
     * For ids that identify the person performing the action (a supervisor_id
     * in the body, a coordinator's own id): anyone but an admin must be that person.
     */
    protected function authorizeSelf(Request $request, int $userId): void
    {
        $user = $request->user();
        if (!$user->isAdmin() && $user->id !== $userId) {
            throw HttpException::forbidden();
        }
    }

    /**
     * Admins and advisors only, and an advisor only for classes assigned to them.
     */
    protected function authorizeBlock(Request $request, string $block): void
    {
        $user = $request->user();
        if ($user->isAdmin()) {
            return;
        }
        if (!$user->is(Role::ADVISOR) || !$this->ownership->advisorHasBlock($user->id, $block)) {
            throw HttpException::forbidden();
        }
    }

    /**
     * Supervisors may only act on their own company.
     */
    protected function authorizeCompany(Request $request, int $companyId): void
    {
        $user = $request->user();
        if ($user->is(Role::SUPERVISOR) && $this->ownership->supervisorCompanyId($user->id) !== $companyId) {
            throw HttpException::forbidden();
        }
    }

    /**
     * Applies authorizeStudent() to the student a record belongs to.
     * 404s if the record doesn't exist.
     */
    protected function authorizeStudentRecord(Request $request, string $table, int $recordId): void
    {
        if ($request->user()->isAdmin()) {
            return;
        }
        $owner = $this->ownership->studentOwnerOf($table, $recordId);
        if ($owner === null) {
            throw HttpException::notFound();
        }
        $this->authorizeStudent($request, $owner);
    }

    /**
     * Looks up $value in an allow-list. Used wherever the client chooses a
     * table or column, since identifiers can't be bound as query parameters.
     *
     * @template T
     * @param array<string, T> $allowed
     * @return T
     */
    protected static function pick(array $allowed, string $value, string $what = 'value'): mixed
    {
        if (!array_key_exists($value, $allowed)) {
            throw HttpException::badRequest("Unknown $what '$value'.");
        }

        return $allowed[$value];
    }

    protected static function intOrNull(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }
}
