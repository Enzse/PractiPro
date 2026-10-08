<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\ReportRepository;
use PractiPro\Repositories\StudentRepository;

/**
 * Final reports, supervisor evaluations, and class-level analytics.
 */
final class ReportController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly ReportRepository $reports,
        private readonly StudentRepository $students,
    ) {
        parent::__construct($ownership);
    }

    public function finalReport(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->reports->finalReportOf($studentId));
    }

    public function createFinalReport(Request $request): Response
    {
        $studentId = (int) $request->require(['user_id'])['user_id'];
        $this->authorizeSelf($request, $studentId);
        $this->reports->createFinalReport($studentId, $request->only(ReportRepository::FINAL_REPORT_ANSWERS));

        return $this->done('Successfully created record');
    }

    public function evaluation(Request $request): Response
    {
        return $this->ok($this->reports->evaluationOf($request->intParam('studentId')));
    }

    public function createEvaluation(Request $request): Response
    {
        $data = $request->require(['supervisor_id', 'student_id']);
        $this->authorizeSelf($request, (int) $data['supervisor_id']);
        $this->reports->createEvaluation(
            (int) $data['supervisor_id'],
            (int) $data['student_id'],
            $request->only(ReportRepository::EVALUATION_ANSWERS),
        );

        return $this->done('Successfully created record');
    }

    // Class analytics for coordinators

    public function finalReportAnalytics(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->reports->finalReportAnalytics($block));
    }

    public function evaluationAnalytics(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->reports->evaluationAnalytics($block));
    }

    public function pendingSubmissions(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->students->pendingSubmissionsByBlock($block));
    }

    public function pendingSubmissionTotals(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->students->pendingSubmissionTotals($block));
    }

    public function studentsWithPendingSubmissions(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);
        $type = $request->param('type');
        self::pick(array_flip(StudentRepository::PENDING_COLUMNS), $type, 'submission type');

        return $this->ok($this->students->withPendingSubmissions($block, $type));
    }
}
