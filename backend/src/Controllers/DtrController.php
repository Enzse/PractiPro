<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\DtrRepository;
use PractiPro\Repositories\OwnershipRepository;

/**
 * Daily time records (clock in / clock out).
 */
final class DtrController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly DtrRepository $dtrs,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        return $this->ok($this->dtrs->records());
    }

    public function forStudent(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->dtrs->records($studentId));
    }

    public function clockIn(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $studentId);

        if ($this->dtrs->hasOpenRecordToday($studentId)) {
            throw HttpException::badRequest('You already have an active clock-in. Please clock out first.');
        }
        $this->dtrs->clockIn($studentId);

        return $this->done('Clock-in successful');
    }

    public function clockOut(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $studentId);

        if ($this->dtrs->clockOut($studentId) === 0) {
            throw HttpException::badRequest('No active clock-in found for today');
        }

        return $this->done('Clock-out successful');
    }

    /**
     * Removes the student's records worth less than an hour.
     */
    public function clearShortRecords(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $studentId);

        $deleted = $this->dtrs->deleteShortRecords($studentId);

        return $deleted > 0
            ? $this->done("Successfully deleted $deleted records.", $deleted)
            : $this->done('No records found to delete.');
    }

    public function updateStatus(Request $request): Response
    {
        $id = $request->intParam('id');
        $this->authorizeStudentRecord($request, 'student_dailytimerecords', $id);
        $status = (string) $request->require(['status'])['status'];
        if ($this->dtrs->setStatus($id, $status) === 0) {
            throw HttpException::notFound('Time record not found.');
        }

        return $this->done('Successfully updated DTR.');
    }
}
