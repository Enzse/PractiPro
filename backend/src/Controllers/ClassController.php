<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\ClassRepository;
use PractiPro\Repositories\CoordinatorRepository;
use PractiPro\Repositories\OwnershipRepository;

/**
 * Class blocks and which coordinators handle them.
 */
final class ClassController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly ClassRepository $classes,
        private readonly CoordinatorRepository $coordinators,
    ) {
        parent::__construct($ownership);
    }

    public function index(Request $request): Response
    {
        return $this->ok($this->classes->blocks($request->hasParam('block') ? $request->param('block') : null));
    }

    public function profile(Request $request): Response
    {
        return $this->ok($this->classes->profile($request->param('block')));
    }

    public function byCourseAndYear(Request $request): Response
    {
        return $this->ok($this->classes->byCourseAndYear($request->param('course'), $request->intParam('year')));
    }

    public function byCoordinator(Request $request): Response
    {
        $coordinatorId = $request->intParam('id');
        $this->authorizeSelf($request, $coordinatorId);

        return $this->ok($this->classes->byCoordinator($coordinatorId));
    }

    public function store(Request $request): Response
    {
        $data = $request->require(['block_name', 'course', 'year_level']);
        $this->classes->create((string) $data['block_name'], (string) $data['course'], (int) $data['year_level']);

        return $this->done('Successfully created a new record');
    }

    public function coordinators(Request $request): Response
    {
        return $this->ok($this->coordinators->withClassCount($request->hasParam('id') ? $request->intParam('id') : null));
    }

    public function assignCoordinator(Request $request): Response
    {
        $data = $request->require(['coordinator_id', 'block_name']);
        $this->coordinators->assignBlock((int) $data['coordinator_id'], (string) $data['block_name']);

        return $this->done('Successfully created a new record');
    }

    public function unassignCoordinator(Request $request): Response
    {
        if ($this->coordinators->unassignBlock($request->intParam('id'), $request->param('block')) === 0) {
            throw HttpException::notFound('No class assignment found for the provided coordinator ID and block name.');
        }

        return $this->done('Successfully deleted the class assignment.');
    }
}
