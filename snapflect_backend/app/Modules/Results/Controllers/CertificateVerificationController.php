<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Services\CertificateVerificationService;
use App\Modules\Results\Resources\CertificateResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CertificateVerificationController extends Controller
{
    public function __construct(
        private CertificateVerificationService $verificationService
    ) {}

    /**
     * GET /api/v1/certificates/verify/{verificationCode}
     * Public, unauthenticated verification endpoint.
     */
    public function verify(string $verificationCode, Request $request): JsonResponse
    {
        try {
            // Rule 6 Enforcement: The VerificationService strictly returns only name, assessment, status, and dates.
            // No scoring logic or audit data is exposed to public verifiers.
            $dto = $this->verificationService->verifyCertificate($verificationCode);
            return response()->json(['data' => new CertificateResource($dto)]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'type' => 'about:blank',
                'title' => 'Verification Failed',
                'status' => 404,
                'detail' => 'The provided certificate code could not be verified.'
            ], 404);
        }
    }
}
