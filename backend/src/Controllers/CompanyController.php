<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Role;
use PractiPro\Database\Database;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\CompanyRepository;
use PractiPro\Repositories\OwnershipRepository;

/**
 * Companies, supervisors, and placing students in a company.
 */
final class CompanyController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly CompanyRepository $companies,
        private readonly Database $db,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        return $this->ok($this->companies->companies($request->hasParam('id') ? $request->intParam('id') : null));
    }

    public function update(Request $request): Response
    {
        $data = $request->require(['id', 'address', 'company_ceo', 'company_size', 'industry', 'scope_of_business', 'itEquipment']);
        $this->authorizeCompany($request, (int) $data['id']);
        $this->companies->updateProfile((int) $data['id'], $data);

        return $this->done('Successfully updated record');
    }

    public function supervisors(Request $request): Response
    {
        return $this->ok($this->companies->supervisors($request->hasParam('id') ? $request->intParam('id') : null));
    }

    public function assignmentExists(Request $request): Response
    {
        $table = $request->param('table');
        $allowedColumns = self::pick(CompanyRepository::ASSIGNMENT_TABLES, $table, 'table');
        $column1 = self::pick(array_combine($allowedColumns, $allowedColumns), $request->param('column1'), 'column');
        $column2 = self::pick(array_combine($allowedColumns, $allowedColumns), $request->param('column2'), 'column');

        $count = $this->companies->assignmentCount($table, $column1, $column2, $request->intParam('id1'), $request->intParam('id2'));

        return $this->ok([['assignment_count' => $count]]);
    }

    // Hiring requests

    public function hiringRequests(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->companies->hiringRequestsForStudent($studentId));
    }

    public function createHiringRequest(Request $request): Response
    {
        $data = $request->require(['company_id', 'student_id', 'supervisor_id']);
        $this->authorizeSelf($request, (int) $data['supervisor_id']);
        $this->authorizeCompany($request, (int) $data['company_id']);

        $this->companies->createHiringRequest((int) $data['company_id'], (int) $data['student_id'], (int) $data['supervisor_id']);

        return $this->done('Successfully created hiring request');
    }

    public function deleteHiringRequest(Request $request): Response
    {
        $hiringRequest = $this->companies->hiringRequest($request->intParam('id'))
            ?? throw HttpException::notFound('No hiring request found');
        $this->authorizeStudent($request, (int) $hiringRequest['student_id']);
        $this->authorizeCompany($request, (int) $hiringRequest['company_id']);

        $this->companies->deleteHiringRequest((int) $hiringRequest['id']);

        return $this->done('Successfully deleted hiring request.');
    }

    // Placements

    /**
     * A student accepts a hiring request and joins the company.
     */
    public function addStudentToCompany(Request $request): Response
    {
        $data = $request->require(['company_id', 'student_id', 'supervisor_id']);
        $companyId = (int) $data['company_id'];
        $studentId = (int) $data['student_id'];

        if ($request->user()->is(Role::STUDENT)) {
            $this->authorizeStudent($request, $studentId);
            // Students can only join a company that offered them a place.
            if ($this->companies->assignmentCount('company_hiring_requests', 'company_id', 'student_id', $companyId, $studentId) === 0) {
                throw HttpException::forbidden('This company has not sent you a hiring request.');
            }
        } else {
            $this->authorizeCompany($request, $companyId);
        }

        $this->companies->addStudentToCompany($companyId, $studentId, (int) $data['supervisor_id']);

        return $this->done('Successfully added student to company');
    }

    public function removeStudentFromCompany(Request $request): Response
    {
        $companyId = $request->intParam('companyId');
        $studentId = $request->intParam('studentId');
        $this->authorizeCompany($request, $companyId);

        $this->db->transaction(function () use ($companyId, $studentId) {
            if ($this->companies->removeStudentFromCompany($companyId, $studentId) === 0) {
                throw HttpException::notFound('No student found from company');
            }
            $this->companies->unassignJob($studentId);
            $this->companies->removeStudentFromSupervisors($studentId);
        });

        return $this->done('Successfully removed student from company.');
    }

    public function addStudentToSupervisor(Request $request): Response
    {
        $data = $request->require(['supervisor_id', 'student_id']);
        $supervisorId = (int) $data['supervisor_id'];
        $studentId = (int) $data['student_id'];
        $this->authorizeSelf($request, $supervisorId);

        if ($this->companies->assignmentCount('rl_supervisor_students', 'supervisor_id', 'student_id', $supervisorId, $studentId) > 0) {
            throw HttpException::conflict('Student is already assigned to the supervisor');
        }
        $this->companies->addStudentToSupervisor($supervisorId, $studentId);

        return $this->done('Successfully added student to supervisor selection');
    }

    public function removeStudentFromSupervisor(Request $request): Response
    {
        $supervisorId = $request->intParam('supervisorId');
        $this->authorizeSelf($request, $supervisorId);

        if ($this->companies->removeStudentFromSupervisors($request->intParam('studentId'), $supervisorId) === 0) {
            throw HttpException::notFound('No student found from supervisor selection');
        }

        return $this->done('Successfully removed student from supervisor selection.');
    }

    // Jobs and schedules

    public function job(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->companies->jobOf($studentId));
    }

    public function assignJob(Request $request): Response
    {
        $data = $request->require(['student_id', 'supervisor_id', 'job_title', 'job_description', 'start_date', 'end_date']);
        $this->authorizeSelf($request, (int) $data['supervisor_id']);

        $this->db->transaction(function () use ($data) {
            $this->companies->unassignJob((int) $data['student_id']);
            $this->companies->assignJob((int) $data['student_id'], (int) $data['supervisor_id'], $data);
        });

        return $this->done('Successfully created job assignation');
    }

    public function schedules(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->companies->schedulesOf($studentId));
    }

    public function assignSchedules(Request $request): Response
    {
        $schedules = $request->all();
        if (!array_is_list($schedules)) {
            throw HttpException::unprocessable('Expected a list of schedules.');
        }
        foreach ($schedules as $schedule) {
            if (!is_array($schedule) || array_diff(['day_of_week', 'start_time', 'end_time', 'has_work'], array_keys($schedule)) !== []) {
                throw HttpException::unprocessable('Each schedule needs day_of_week, start_time, end_time and has_work.');
            }
        }

        $this->companies->replaceSchedules($request->intParam('studentId'), $schedules);

        return $this->done('Successfully assigned schedules to student');
    }

    public function clearSchedules(Request $request): Response
    {
        if ($this->companies->clearSchedules($request->intParam('studentId')) === 0) {
            throw HttpException::notFound('No student found');
        }

        return $this->done('Successfully unassigned schedules to student');
    }
}
