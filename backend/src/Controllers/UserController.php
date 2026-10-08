<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Role;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\CoordinatorRepository;
use PractiPro\Repositories\LookupRepository;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\UserRepository;

/**
 * Account administration, plus the role and department lookups.
 */
final class UserController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly UserRepository $users,
        private readonly CoordinatorRepository $coordinators,
        private readonly LookupRepository $lookups,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        return $this->ok($this->users->all());
    }

    public function show(Request $request): Response
    {
        $id = $request->intParam('id');
        $this->authorizeSelf($request, $id);

        return $this->ok($this->users->find($id));
    }

    public function admins(Request $request): Response
    {
        return $this->ok($this->users->withRole(Role::ADMIN));
    }

    public function update(Request $request): Response
    {
        $id = $request->intParam('id');
        $data = $request->require(['role', 'isActive']);
        $role = (string) $data['role'];

        $validRoles = array_column($this->lookups->roles(), 'code');
        if (!in_array($role, $validRoles, true)) {
            throw HttpException::unprocessable("Unknown role '$role'.");
        }
        // Only a superadmin can create or change another superadmin.
        $touchesSuperadmin = $role === Role::SUPERADMIN || $this->users->roleOf($id) === Role::SUPERADMIN;
        if ($touchesSuperadmin && !$request->user()->is(Role::SUPERADMIN)) {
            throw HttpException::forbidden('Only a superadmin can change superadmin accounts.');
        }

        $this->users->update($id, $role, (bool) $data['isActive']);

        return $this->done('Successfully updated record');
    }

    public function delete(Request $request): Response
    {
        $id = $request->intParam('id');
        if ($id === $request->user()->id) {
            throw HttpException::badRequest("You can't delete your own account.");
        }
        if ($this->users->roleOf($id) === Role::SUPERADMIN && !$request->user()->is(Role::SUPERADMIN)) {
            throw HttpException::forbidden('Only a superadmin can delete superadmin accounts.');
        }
        if ($this->users->delete($id) === 0) {
            throw HttpException::notFound('User not found.');
        }

        return $this->done('Successfully deleted record');
    }

    public function updateCoordinator(Request $request): Response
    {
        $department = (string) $request->require(['department'])['department'];
        $this->coordinators->updateDepartment($request->intParam('id'), $department);

        return $this->done('Successfully updated record');
    }

    public function roles(Request $request): Response
    {
        return $this->ok($this->lookups->roles($request->hasParam('id') ? $request->intParam('id') : null));
    }

    public function departments(Request $request): Response
    {
        return $this->ok($this->lookups->departments($request->hasParam('id') ? $request->intParam('id') : null));
    }
}
