<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Role;
use PractiPro\Config;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\ClassJoinRepository;
use PractiPro\Repositories\OwnershipRepository;

/**
 * Join requests, invitations and shareable join links for classes.
 */
final class ClassJoinController extends Controller
{
    private const LINK_TTL_SECONDS = 30 * 60;

    public function __construct(
        OwnershipRepository $ownership,
        private readonly ClassJoinRepository $joins,
        private readonly Config $config,
    ) {
        parent::__construct($ownership);
    }

    // Join requests

    public function studentRequests(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->joins->requestsByStudent($studentId));
    }

    public function blockRequests(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->joins->requestsForBlock($block));
    }

    public function blockRequestCount(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->joins->requestCountForBlock($block));
    }

    public function createRequest(Request $request): Response
    {
        $data = $request->require(['student_id', 'class']);
        $studentId = (int) $data['student_id'];
        $this->authorizeSelf($request, $studentId);

        if ($this->joins->studentHasRequest($studentId)) {
            throw HttpException::conflict('Join request already exists');
        }
        $this->joins->createRequest($studentId, (string) $data['class']);

        return $this->done('Successfully created join request');
    }

    /** A student withdraws their own request. */
    public function cancelRequest(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeSelf($request, $studentId);

        if ($this->joins->deleteRequestsOfStudent($studentId) === 0) {
            throw HttpException::notFound('No request found');
        }

        return $this->done('Successfully deleted request.');
    }

    /** A coordinator turns a request down. */
    public function rejectRequest(Request $request): Response
    {
        $requestId = $request->intParam('id');
        $block = $this->joins->blockOfRequest($requestId) ?? throw HttpException::notFound('No request found');
        $this->authorizeBlock($request, $block);

        $this->joins->deleteRequest($requestId);

        return $this->done('Successfully deleted request.');
    }

    // Invitations

    public function studentInvitations(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->joins->invitationsForStudent($studentId));
    }

    public function studentInvitationCount(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $this->authorizeStudent($request, $studentId);

        return $this->ok($this->joins->invitationCountForStudent($studentId));
    }

    public function blockInvitations(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->joins->invitationsForBlock($block));
    }

    public function blockInvitationCount(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->joins->invitationCountForBlock($block));
    }

    public function invitationExists(Request $request): Response
    {
        $block = $request->param('block');
        $this->authorizeBlock($request, $block);

        return $this->ok($this->joins->invitationCount($request->intParam('studentId'), $block));
    }

    public function createInvitation(Request $request): Response
    {
        $data = $request->require(['student_id', 'advisor_id', 'class']);
        $this->authorizeSelf($request, (int) $data['advisor_id']);
        $this->authorizeBlock($request, (string) $data['class']);

        if ((int) $this->joins->invitationCount((int) $data['student_id'], (string) $data['class'])[0]['invitationCount'] > 0) {
            throw HttpException::conflict('Join invitation already exists');
        }
        $this->joins->createInvitation((int) $data['student_id'], (int) $data['advisor_id'], (string) $data['class']);

        return $this->done('Successfully created class invitation');
    }

    /** Removes every invitation a student has (they declined, or joined a class). */
    public function cancelStudentInvitations(Request $request): Response
    {
        $studentId = $request->intParam('studentId');
        $user = $request->user();
        if ($user->is(Role::ADVISOR)) {
            $deleted = $this->joins->deleteInvitationsOfStudentByAdvisor($studentId, $user->id);
        } else {
            $this->authorizeStudent($request, $studentId);
            $deleted = $this->joins->deleteInvitationsOfStudent($studentId);
        }

        if ($deleted === 0) {
            throw HttpException::notFound('No invitation found');
        }

        return $this->done('Successfully deleted invitation.');
    }

    public function cancelInvitation(Request $request): Response
    {
        $invitationId = $request->intParam('id');
        $block = $this->joins->blockOfInvitation($invitationId) ?? throw HttpException::notFound('No invitation found');
        $this->authorizeBlock($request, $block);

        $this->joins->deleteInvitation($invitationId);

        return $this->done('Successfully deleted invitation.');
    }

    // Join links

    public function createLink(Request $request): Response
    {
        $block = (string) $request->require(['class'])['class'];
        $this->authorizeBlock($request, $block);

        $this->joins->deleteExpiredLinks();
        $existing = $this->joins->linkForBlock($block);
        if ($existing !== null) {
            return $this->done('Existing link found.', $this->linkUrl((string) $existing['join_token_hash']));
        }

        $token = bin2hex(random_bytes(16));
        $this->joins->createLink($block, $token, date('Y-m-d H:i:s', time() + self::LINK_TTL_SECONDS));

        return $this->done('Successfully created class join link', $this->linkUrl($token));
    }

    public function checkLink(Request $request): Response
    {
        $link = $this->joins->linkByToken($request->param('token'));
        if ($link === null) {
            throw HttpException::notFound('Token Not Found');
        }
        if (strtotime((string) $link['join_token_expires_at']) <= time()) {
            throw HttpException::unauthorized('Token Expired');
        }

        return $this->done('Token Found!', $link);
    }

    private function linkUrl(string $token): string
    {
        return $this->config->frontendUrl . '/join-class?token=' . $token;
    }
}
