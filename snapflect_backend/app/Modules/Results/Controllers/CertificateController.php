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
     * GET /api/v1/certificates
     * Authenticated candidate listing their own certificates.
     */
    public function index(Request $request): JsonResponse
    {
        $ownerUserId = $request->user()->id;
        $perPage = $request->input('per_page', 20);

        $results = \Illuminate\Support\Facades\DB::table('certificates')
            ->join('assessment_results', 'certificates.assessment_result_id', '=', 'assessment_results.id')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->join('users', 'assessment_attempts.candidate_user_id', '=', 'users.id')
            ->join('assessments', 'assessment_attempts.assessment_id', '=', 'assessments.id')
            ->where('assessment_attempts.candidate_user_id', $ownerUserId)
            ->where('certificates.is_deleted', false)
            ->select(
                'certificates.uuid as certificateUuid',
                'certificates.issued_at as issuedAt',
                'certificates.verification_code as verificationCode',
                'certificates.status',
                'certificates.storage_path as downloadUrl',
                'users.name as candidateName',
                'assessments.title as assessmentName'
            )
            ->orderBy('certificates.issued_at', 'desc')
            ->paginate($perPage);

        return CertificateResource::collection($results)->response();
    }

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
