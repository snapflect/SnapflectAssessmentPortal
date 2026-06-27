<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Services\CertificateVerificationService;
use App\Modules\Results\Resources\CertificateResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateVerificationService $verificationService
    ) {}

    /**
     * GET /api/v1/certificates/{certificateUuid}
     * Authenticated candidate downloading their own certificate.
     */
    public function show(string $certificateUuid, Request $request): JsonResponse
    {
        try {
            // Remediated: Enforce ownership validation using authenticated user context
            $ownerUserId = $request->user()->id;
            $dto = $this->verificationService->getCertificateByUuid($certificateUuid, $ownerUserId);
            return response()->json(['data' => new CertificateResource($dto)]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'type' => 'about:blank',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => $e->getMessage()
            ], 404);
        }
    }
}
