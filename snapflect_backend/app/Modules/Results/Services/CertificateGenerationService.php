<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CertificateGenerationService
{
    /**
     * Triggered automatically via Event (e.g. AssessmentResultPublished)
     */
    public function generateForAttemptIfEligible(string $attemptUuid, int $resultVersion): void
    {
        // 1. Fetch Attempt & Blueprint
        $attempt = DB::table('assessment_attempts')->where('uuid', $attemptUuid)->first();
        if (!$attempt) return;

        // Verify eligibility against blueprint (simulated)
        // if (!$blueprint->certification_enabled) return;

        // 2. Fetch Score Version
        $result = DB::table('assessment_results')
            ->where('assessment_attempt_id', $attempt->id)
            ->where('result_version', $resultVersion)
            ->first();

        if (!$result || $result->pass_fail_status !== 'PASS') {
            return;
        }

        // 3. Prevent duplicates
        $exists = DB::table('certificates')
            ->where('assessment_result_id', $result->id)
            ->exists();
            
        if ($exists) return;

        // 4. Generate Business Artifact (Physical PDF)
        $certUuid = (string) Str::uuid();
        $verificationCode = strtoupper(Str::random(10));
        
        $pdfContent = $this->generatePdfBytes($attempt, $result, $verificationCode);
        
        // 5. Object Storage Integration (S3/Azure)
        $storagePath = "certificates/{$attempt->organization_id}/{$certUuid}.pdf";
        Storage::disk('s3')->put($storagePath, $pdfContent);

        // 6. DB Persistence
        DB::table('certificates')->insert([
            'uuid' => $certUuid,
            'organization_id' => $attempt->organization_id,
            'assessment_result_id' => $result->id,
            'result_version' => $resultVersion,
            'verification_code' => $verificationCode,
            'status' => 'VALID',
            'storage_path' => $storagePath,
            'issued_at' => Carbon::now(),
        ]);
    }

    /**
     * Handles Rule 3: Revocation Governance on Recalculation
     */
    public function handleRecalculationRevocation(string $attemptUuid, int $newVersion, bool $overallPassed): void
    {
        if ($overallPassed) {
            // New version is passing, a new certificate will be issued by the publish event.
            // Old certificates are NOT revoked. They reflect valid past versions.
            return;
        }

        $attempt = DB::table('assessment_attempts')->where('uuid', $attemptUuid)->first();
        if (!$attempt) return;

        // The candidate has failed Version N+1. Revoke any previously VALID certificates for this attempt.
        DB::table('certificates')
            ->join('assessment_results', 'certificates.assessment_result_id', '=', 'assessment_results.id')
            ->where('assessment_results.assessment_attempt_id', $attempt->id)
            ->update([
                'certificates.status' => 'REVOKED',
                'certificates.updated_at' => Carbon::now()
            ]);
    }

    private function generatePdfBytes(object $attempt, object $result, string $code): string
    {
        // Simulated DomPDF or Snappy integration
        return "%PDF-1.4 Simulated Certificate Content [Verification: {$code}]";
    }
}
