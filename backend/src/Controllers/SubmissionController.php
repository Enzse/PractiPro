<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Role;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\SubmissionRepository;
use PractiPro\Support\Uploads;

/**
 * Uploading, listing, downloading, deleting and approving submitted files.
 */
final class SubmissionController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly SubmissionRepository $submissions,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        $table = $this->studentFileTable($request);
        $studentId = $request->hasParam('studentId') ? $request->intParam('studentId') : null;

        if ($studentId !== null) {
            $this->authorizeStudent($request, $studentId);
        }

        return $this->ok($this->submissions->studentFiles($table, $studentId));
    }

    public function upload(Request $request): Response
    {
        $table = $this->studentFileTable($request);
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $studentId);

        $label = $request->hasParam('label') && $request->param('label') !== 'null' ? $request->param('label') : null;
        if ($table !== 'finalreports' && $label === null) {
            throw HttpException::badRequest('A requirement name or week number is required.');
        }

        $this->submissions->storeStudentFile($table, $studentId, Uploads::document($request->file()), $label);

        return $this->done('Successfully uploaded file');
    }

    public function download(Request $request): Response
    {
        $table = $request->param('table');
        self::pick(SubmissionRepository::DOWNLOADABLE_TABLES, $table, 'table');
        $id = $request->intParam('id');
        $this->authorizeStudentRecord($request, $table, $id);

        $file = $this->submissions->download($table, $id) ?? throw HttpException::notFound('File not found.');

        return Response::file($file['file_data'], Uploads::mimeType($file['file_data']), $file['file_name']);
    }

    public function delete(Request $request): Response
    {
        $table = $request->param('table');
        $id = $request->intParam('id');
        if (!in_array($table, ['submissions', 'documentations', 'finalreports', 'war', 'supervisor_student_evaluations'], true)) {
            throw HttpException::badRequest("Unknown table '$table'.");
        }

        $this->authorizeStudentRecord($request, $table, $id);
        $user = $request->user();
        if ($user->is(Role::STUDENT) && $table === 'supervisor_student_evaluations') {
            throw HttpException::forbidden();
        }
        if ($user->is(Role::SUPERVISOR)) {
            // Supervisors may only remove evaluation files they uploaded.
            if ($table !== 'supervisor_student_evaluations' || $this->submissions->evaluationUploader($id) !== $user->id) {
                throw HttpException::forbidden();
            }
        }

        $this->submissions->delete($table, $id);

        return $this->done('Successfully deleted record');
    }

    public function weekNumbers(Request $request): Response
    {
        $table = $request->param('table');
        if (!in_array($table, SubmissionRepository::WEEKLY_TABLES, true)) {
            throw HttpException::badRequest("Unknown table '$table'.");
        }
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        // This endpoint has always returned a bare array rather than the usual envelope.
        return Response::json($this->submissions->weekNumbers($table, $studentId));
    }

    public function advisorApproval(Request $request): Response
    {
        $table = $request->param('table');
        if (!in_array($table, SubmissionRepository::ADVISOR_APPROVAL_TABLES, true)) {
            throw HttpException::badRequest("Unknown table '$table'.");
        }
        $id = $request->intParam('id');
        $this->authorizeStudentRecord($request, $table, $id);
        $approval = $request->require(['advisor_approval'])['advisor_approval'];
        $this->submissions->setAdvisorApproval($table, $id, $approval);

        return $this->done('Successfully updated approval.');
    }

    public function supervisorApproval(Request $request): Response
    {
        $table = $request->param('table');
        if (!in_array($table, SubmissionRepository::SUPERVISOR_APPROVAL_TABLES, true)) {
            throw HttpException::badRequest("Unknown table '$table'.");
        }
        $id = $request->intParam('id');
        $this->authorizeStudentRecord($request, $table, $id);
        $approval = $request->require(['supervisor_approval'])['supervisor_approval'];
        $this->submissions->setSupervisorApproval($table, $id, $approval);

        return $this->done('Successfully updated approval.');
    }

    // Supervisors' evaluation files

    public function evaluationFiles(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->submissions->evaluationFilesFor($studentId));
    }

    public function uploadEvaluationFile(Request $request): Response
    {
        $supervisorId = $request->intParam('supervisorId');
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $supervisorId);
        $this->authorizeStudent($request, $studentId);

        $this->submissions->storeEvaluationFile($supervisorId, $studentId, Uploads::document($request->file()));

        return $this->done('Successfully uploaded file');
    }

    private function studentFileTable(Request $request): string
    {
        $table = $request->param('table');
        self::pick(SubmissionRepository::STUDENT_FILE_TABLES, $table, 'table');

        return $table;
    }
}
