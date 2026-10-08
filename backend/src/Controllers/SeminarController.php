<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\SeminarRepository;
use PractiPro\Support\Uploads;

final class SeminarController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly SeminarRepository $seminars,
    ) {
        parent::__construct($ownership);
    }

    public function forStudent(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->seminars->forStudent($studentId));
    }

    public function store(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $studentId);

        $record = $request->require(['event_name', 'event_date', 'event_type', 'duration']);
        $recordId = $this->seminars->create($studentId, $record);

        return $this->done('Successfully uploaded record', ['record_id' => $recordId]);
    }

    public function uploadCertificate(Request $request): Response
    {
        $recordId = $request->intParam('recordId');
        $this->authorizeStudentRecord($request, 'student_seminar_records', $recordId);

        $this->seminars->attachCertificate($recordId, Uploads::document($request->file()));

        return $this->done('Successfully uploaded file');
    }

    public function delete(Request $request): Response
    {
        $id = $request->intParam('id');
        $this->authorizeStudentRecord($request, 'student_seminar_records', $id);

        if ($this->seminars->delete($id) === 0) {
            throw HttpException::notFound('No record found');
        }

        return $this->done('Successfully deleted record.');
    }
}
