<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Role;
use PractiPro\Database\Database;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\ClassJoinRepository;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\StudentRepository;

final class StudentController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly StudentRepository $students,
        private readonly ClassJoinRepository $classJoins,
        private readonly Database $db,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        return $this->ok($this->students->all());
    }

    public function show(Request $request): Response
    {
        $id = $request->intParam('id');
        $this->authorizeStudent($request, $id);

        return $this->ok($this->students->find($id));
    }

    public function ojtStatusIndex(Request $request): Response
    {
        return $this->ok($this->students->ojtStatus());
    }

    public function ojtStatus(Request $request): Response
    {
        $id = $request->intParam('id');
        if ($request->user()->is(Role::STUDENT)) {
            $this->authorizeStudent($request, $id);
        }

        return $this->ok($this->directory($request, $this->students->ojtStatus($id)));
    }

    public function byBlock(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->students->ojtStatusByBlock($block));
    }

    public function byCourseAndYear(Request $request): Response
    {
        return $this->ok($this->students->byCourseAndYear($request->param('course'), $request->intParam('year')));
    }

    public function byStudentNumber(Request $request): Response
    {
        return $this->ok($this->directory($request, $this->students->byStudentNumber($request->param('studentNumber'))));
    }

    /**
     * Coordinators and supervisors can look up any student (to invite or hire
     * them), but only see contact details for students they are responsible for.
     *
     * @param list<array<string, mixed>> $students
     * @return list<array<string, mixed>>
     */
    private function directory(Request $request, array $students): array
    {
        return array_map(function (array $student) use ($request) {
            if (!$this->canAccessStudent($request, (int) $student['id'])) {
                $student['phoneNumber'] = $student['address'] = $student['dateOfBirth'] = null;
            }

            return $student;
        }, $students);
    }

    public function byCompany(Request $request): Response
    {
        $companyId = $request->intParam('companyId');
        $this->authorizeCompany($request, $companyId);

        return $this->ok($this->students->byCompany($companyId));
    }

    public function bySupervisor(Request $request): Response
    {
        $supervisorId = $request->intParam('supervisorId');
        $this->authorizeSelf($request, $supervisorId);

        return $this->ok($this->students->bySupervisor($supervisorId));
    }

    public function update(Request $request): Response
    {
        $id = $request->intParam('id');
        $this->authorizeSelf($request, $id);

        $profile = $request->require(['firstName', 'lastName', 'studentId', 'program', 'year']);
        $profile += $request->only(['phoneNumber', 'address', 'dateOfBirth']);
        $this->students->updateProfile($id, $profile);

        return $this->done('Successfully updated record');
    }

    /**
     * Puts a student in a class and clears their other pending invitations and requests.
     */
    public function assignBlock(Request $request): Response
    {
        $studentId = $request->intParam('id');
        $block = (string) $request->require(['block_name'])['block_name'];

        $user = $request->user();
        if ($user->is(Role::STUDENT)) {
            // A student joins by accepting an invitation or opening a valid join link.
            $this->authorizeSelf($request, $studentId);
            $token = $request->input('token');
            $invited = $this->classJoins->hasInvitation($studentId, $block);
            if (!$invited && !(is_string($token) && $this->classJoins->isValidLink($token, $block))) {
                throw HttpException::forbidden('You need an invitation or a valid join link to join this class.');
            }
        } elseif ($user->is(Role::ADVISOR)) {
            // A coordinator adds a student by accepting their join request.
            $this->authorizeBlock($request, $block);
            if (!$this->classJoins->hasRequest($studentId, $block)) {
                throw HttpException::forbidden('This student has not asked to join this class.');
            }
        }

        $this->db->transaction(function () use ($studentId, $block) {
            $this->classJoins->deleteInvitationsOfStudent($studentId);
            $this->classJoins->deleteRequestsOfStudent($studentId);
            $this->students->assignBlock($studentId, $block);
        });

        return $this->done('Successfully updated record');
    }

    public function requirementsIndex(Request $request): Response
    {
        return $this->ok($this->students->requirements());
    }

    public function requirements(Request $request): Response
    {
        $id = $request->intParam('id');
        $this->authorizeStudent($request, $id);

        return $this->ok($this->students->requirements($id));
    }

    public function pendingSubmissions(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);
        $column = $request->hasParam('type')
            ? self::pick(array_combine(StudentRepository::PENDING_COLUMNS, StudentRepository::PENDING_COLUMNS), $request->param('type'), 'submission type')
            : null;

        return $this->ok($this->students->pendingSubmissions($studentId, $column));
    }
}
