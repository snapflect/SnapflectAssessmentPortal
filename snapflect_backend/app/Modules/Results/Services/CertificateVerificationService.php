<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CertificateDto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class CertificateVerificationService
{
    /**
     * @throws InvalidArgumentException
     */
    public function getCertificateByUuid(string $certificateUuid, ?int $ownerUserId = null): CertificateDto
    {
        return $this->fetchCertificate('uuid', $certificateUuid, $ownerUserId);
    }

    /**
     * Public verification endpoint backing method.
     * @throws InvalidArgumentException
     */
    public function verifyCertificate(string $verificationCode): CertificateDto
    {
        return $this->fetchCertificate('verification_code', $verificationCode, null);
    }

    private function fetchCertificate(string $column, string $value, ?int $ownerUserId): CertificateDto
    {
        $query = DB::table('certificates')
            ->join('assessment_results', 'certificates.assessment_result_id', '=', 'assessment_results.id')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->join('users', 'assessment_attempts.candidate_user_id', '=', 'users.id')
            ->join('assessments', 'assessment_attempts.assessment_id', '=', 'assessments.id')
            ->where("certificates.{$column}", $value)
            ->select(
                'certificates.uuid',
                'certificates.verification_code',
                'certificates.status',
                'certificates.issued_at',
                'certificates.storage_path',
                'certificates.storage_path',
                'users.first_name',
                'users.last_name',
                'assessments.assessment_name'
            );

        if ($ownerUserId !== null) {
            $query->where('assessment_attempts.candidate_user_id', $ownerUserId);
        }

        $cert = $query->first();

        if (!$cert) {
            throw new InvalidArgumentException("Certificate not found.");
        }

        return new CertificateDto(
            certificateUuid: $cert->uuid,
            verificationCode: $cert->verification_code,
            status: $cert->status, // 'VALID' or 'REVOKED'
            issuedAt: $cert->issued_at,
            candidateName: preg_replace('/\s+/', ' ', trim($cert->first_name . ' ' . $cert->last_name)),
            assessmentName: $cert->assessment_name,
            downloadUrl: $cert->storage_path
        );
    }
}
