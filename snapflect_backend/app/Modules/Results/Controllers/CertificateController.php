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
                'users.first_name',
                'users.last_name',
                'assessments.assessment_name as assessmentName'
            )
            ->orderBy('certificates.issued_at', 'desc')
            ->paginate($perPage);

        // Map the paginated results to include candidateName
        $results->getCollection()->transform(function ($item) {
            $item->candidateName = preg_replace('/\s+/', ' ', trim($item->first_name . ' ' . $item->last_name));
            unset($item->first_name, $item->last_name);
            return $item;
        });

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
            $user = $request->user();
            $ownerUserId = ($user->hasRole(['ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'PLATFORM_ADMIN', 'REVIEWER'])) ? null : $user->id;
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

    /**
     * GET /api/v1/certificates/{certificateUuid}/download
     * Returns the raw HTML for the certificate so the frontend can print it to PDF.
     */
    public function download(string $certificateUuid, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $ownerUserId = ($user->hasRole(['ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'PLATFORM_ADMIN', 'REVIEWER'])) ? null : $user->id;
            $dto = $this->verificationService->getCertificateByUuid($certificateUuid, $ownerUserId);
            
            $candidateName = $dto->candidateName;
            $assessmentName = $dto->assessmentName;
                
            $score = \Illuminate\Support\Facades\DB::table('assessment_results')
                ->join('certificates', 'assessment_results.id', '=', 'certificates.assessment_result_id')
                ->where('certificates.uuid', $dto->certificateUuid)
                ->value('overall_percentage');

            $html = view('certificate', [
                'candidateName' => $candidateName,
                'assessmentName' => $assessmentName,
                'score' => $score,
                'date' => \Carbon\Carbon::parse($dto->issuedAt)->format('d M, Y'),
                'certificateId' => $dto->certificateUuid,
                'verificationCode' => $dto->verificationCode
            ])->render();

            return response()->json([
                'success' => true,
                'data' => [
                    'html' => $html
                ]
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'type' => 'about:blank',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * GET /api/v1/results/{resultUuid}/certificate/download
     */
    public function downloadByResult(string $resultUuid, Request $request): JsonResponse
    {
        try {
            $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->where('uuid', $resultUuid)->value('id');
            if (!$resultId) {
                throw new \InvalidArgumentException("Result not found.");
            }

            $cert = \Illuminate\Support\Facades\DB::table('certificates')
                ->where('assessment_result_id', $resultId)
                ->where('status', 'VALID')
                ->where('is_deleted', false)
                ->first();

            if (!$cert) {
                throw new \InvalidArgumentException("Certificate not generated yet or is inactive.");
            }

            return $this->download($cert->uuid, $request);
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
