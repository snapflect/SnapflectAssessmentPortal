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
        try {
            Storage::disk('local')->put($storagePath, $pdfContent);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Could not save certificate to disk.", ['error' => $e->getMessage()]);
        }

        // 6. DB Persistence
        DB::table('certificates')->insert([
            'uuid' => $certUuid,
            'assessment_result_id' => $result->id,
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
        $organizationName = 'SnapFlect Assessments';
        $candidateName = DB::table('users')->where('id', $attempt->candidate_user_id)->value('first_name') . ' ' . DB::table('users')->where('id', $attempt->candidate_user_id)->value('last_name');
        $assessmentName = DB::table('assessments')->where('id', $attempt->assessment_id)->value('assessment_name');
        
        $lines = [
            $organizationName,
            "Certificate of Completion",
            "",
            "This certifies that:",
            $candidateName,
            "",
            "has successfully completed the assessment:",
            $assessmentName,
            "",
            "Date: " . Carbon::now()->format('F j, Y'),
            "Verification Code: $code",
            "Score: {$result->overall_percentage}%"
        ];

        // Construct a raw, valid PDF 1.4 document
        $objects = [];
        $objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        $objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
        $objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

        $stream = "BT\n/F1 18 Tf\n";
        $y = 700;
        foreach ($lines as $line) {
            $safeLine = strtr($line, ['(' => '\\(', ')' => '\\)', '\\' => '\\\\']);
            $stream .= "100 $y Td\n($safeLine) Tj\n-100 -$y Td\n";
            $y -= 30;
        }
        $stream .= "ET";
        $objects[4] = "<< /Length " . strlen($stream) . " >>\nstream\n" . $stream . "\nendstream";

        $out = "%PDF-1.4\n";
        $xrefs = [];
        $offset = strlen($out);
        $xrefs[0] = "0000000000 65535 f \n";
        for ($i = 1; $i <= 5; $i++) {
            $xrefs[$i] = sprintf("%010d 00000 n \n", $offset);
            $obj = "$i 0 obj\n" . $objects[$i] . "\nendobj\n";
            $out .= $obj;
            $offset += strlen($obj);
        }
        $xrefStart = $offset;
        $out .= "xref\n0 6\n";
        foreach ($xrefs as $x) $out .= $x;
        $out .= "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n$xrefStart\n%%EOF\n";

        return $out;
    }
}
