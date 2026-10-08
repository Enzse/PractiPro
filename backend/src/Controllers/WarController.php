<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\WarRepository;

/**
 * Weekly accomplishment reports.
 */
final class WarController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly WarRepository $war,
    ) {
        parent::__construct($ownership);
    }

    public function records(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);
        $week = $request->hasParam('week') ? $request->intParam('week') : null;

        return $this->ok($this->war->records($studentId, $week));
    }

    public function create(Request $request): Response
    {
        $data = $request->require(['student_id', 'week']);
        $this->authorizeSelf($request, (int) $data['student_id']);
        $this->war->create((int) $data['student_id'], (int) $data['week']);

        return $this->done('Successfully created record');
    }

    public function submit(Request $request): Response
    {
        $data = $request->require(['id', 'isSubmitted']);
        $recordId = (int) $data['id'];
        $this->authorizeStudentRecord($request, 'student_war_records', $recordId);

        // Submitting resets both approvals to Pending; withdrawing clears them.
        // The client never chooses the approval status itself.
        $isSubmitted = (bool) $data['isSubmitted'];
        $this->war->submit($recordId, (int) $isSubmitted, $isSubmitted ? 'Pending' : null);

        return $this->done('Successfully submitted record');
    }

    public function activities(Request $request): Response
    {
        $recordId = $request->intParam('recordId');
        $this->authorizeStudentRecord($request, 'student_war_records', $recordId);

        return $this->ok($this->war->activities($recordId));
    }

    public function addActivity(Request $request): Response
    {
        $data = $request->require(['war_id', 'date', 'description', 'startTime', 'endTime']);
        $recordId = (int) $data['war_id'];
        $this->authorizeStudentRecord($request, 'student_war_records', $recordId);
        $this->war->addActivity($recordId, $data);

        return $this->done('Successfully created record');
    }

    public function clearActivities(Request $request): Response
    {
        $recordId = $request->intParam('recordId');
        $this->authorizeStudentRecord($request, 'student_war_records', $recordId);
        $this->war->clearActivities($recordId);

        return $this->done('Successfully deleted activities.');
    }
}
