<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Repositories\Interfaces\AssessmentSessionRepositoryInterface;
use App\Modules\Delivery\DTOs\LaunchAssessmentDto;
use App\Modules\Delivery\DTOs\ResumeSessionDto;
use App\Modules\Delivery\DTOs\TerminateSessionDto;
use Illuminate\Support\Facades\DB;
use App\Modules\Delivery\Exceptions\AssessmentSessionException;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\DTOs\ExpireAttemptDto;

class AssessmentSessionService
{
    public function __construct(
        private readonly AssessmentSessionRepositoryInterface $sessionRepository,
        private readonly AssessmentAttemptService $attemptService,
        private readonly AttemptAuditService $auditService
    ) {}

    public function launchAssessment(LaunchAssessmentDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            // Validate Candidate Access
            // Enforce snapshot-only delivery
            // Enforce one active attempt rule
            // Create Session
            // Generate Session Token
            // Audit Event: SESSION_STARTED
            return [];
        });
    }

    public function resumeSession(ResumeSessionDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $session = AssessmentSession::where('uuid', $dto->session_uuid)->firstOrFail();
            
            if ($session->session_status === 'LAUNCHED') {
                $session->session_status = 'PAUSED';
            } elseif ($session->session_status === 'PAUSED') {
                $session->session_status = 'LAUNCHED';
            }
            $session->save();
            
            return ['status' => $session->session_status];
        });
    }

    public function terminateSession(TerminateSessionDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $session = AssessmentSession::where('uuid', $dto->session_uuid)->firstOrFail();
            $session->session_status = 'TERMINATED';
            $session->save();
        });
    }

    public function expireSession(string $sessionUuid): void
    {
        DB::transaction(function () use ($sessionUuid) {
            $session = AssessmentSession::where('uuid', $sessionUuid)->first();
            if ($session && $session->session_status !== 'EXPIRED') {
                $session->session_status = 'EXPIRED';
                $session->save();

                // If there's an active attempt, expire it too
                $latestAttempt = $session->latestAttempt;
                if ($latestAttempt && $latestAttempt->status === 'IN_PROGRESS') {
                    $this->attemptService->expireAttempt(new ExpireAttemptDto($latestAttempt->uuid, 'Session expired'));
                }
            }
        });
    }

    public function validateCandidateAccess(string $sessionUuid, string $candidateUuid): bool
    {
        return true;
    }
}
