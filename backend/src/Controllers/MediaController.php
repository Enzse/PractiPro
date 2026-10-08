<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\MediaRepository;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Support\Uploads;

/**
 * Profile pictures and company logos.
 */
final class MediaController extends Controller
{
    public function __construct(
        OwnershipRepository $ownership,
        private readonly MediaRepository $media,
    ) {
        parent::__construct($ownership);
    }

    public function avatar(Request $request): Response
    {
        return $this->image($this->media->avatar($request->intParam('userId')));
    }

    public function uploadAvatar(Request $request): Response
    {
        $userId = $request->intParam('userId');
        $this->authorizeSelf($request, $userId);
        $this->media->replaceAvatar($userId, Uploads::image($request->file()));

        return $this->done('Successfully uploaded avatar');
    }

    public function logo(Request $request): Response
    {
        return $this->image($this->media->logo($request->intParam('companyId')));
    }

    public function uploadLogo(Request $request): Response
    {
        $companyId = $request->intParam('companyId');
        $this->authorizeCompany($request, $companyId);
        $this->media->replaceLogo($companyId, Uploads::image($request->file()));

        return $this->done('Successfully uploaded logo');
    }

    /**
     * No image is an empty 200 response: the frontend checks for a zero-size blob.
     */
    private function image(?string $data): Response
    {
        return $data === null
            ? Response::empty()
            : Response::file($data, Uploads::mimeType($data));
    }
}
