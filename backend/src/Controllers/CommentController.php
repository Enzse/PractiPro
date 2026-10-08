<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\CommentRepository;
use PractiPro\Repositories\OwnershipRepository;

final class CommentController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly CommentRepository $comments,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        [$table, $recordId] = $this->authorizedThread($request);

        return $this->ok($this->comments->forRecord($table, $recordId));
    }

    public function store(Request $request): Response
    {
        [$table, $recordId] = $this->authorizedThread($request);
        $comment = trim((string) $request->require(['comments'])['comments']);
        if ($comment === '') {
            throw HttpException::unprocessable('A comment cannot be empty.');
        }

        // The author's name comes from their login token, not the request body,
        // so nobody can post a comment under someone else's name.
        $this->comments->add($table, $recordId, $comment, $request->user()->fullName());

        return $this->done('Successfully submitted comment');
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function authorizedThread(Request $request): array
    {
        $table = $request->param('table');
        $parentTable = self::pick(CommentRepository::PARENT_TABLES, $table, 'comments table');
        $recordId = $request->intParam('id');
        $this->authorizeStudentRecord($request, $parentTable, $recordId);

        return [$table, $recordId];
    }
}
