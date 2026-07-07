<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Exceptions\SessionLaunchException;
use App\Modules\Delivery\DTOs\LaunchSessionDto;
use App\Modules\Delivery\DTOs\LaunchResultDto;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Services\SnapshotGenerationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SessionLaunchService
{
    public function __construct(
        private readonly SessionStateMachine $stateMachine,
        private readonly SnapshotGenerationService $snapshotService,
        private readonly RandomizationEngineService $randomizationEngine,
        private readonly AttemptCreationService $attemptService
    ) {
    }

    public function createSession(string $assessmentUuid, int $candidateUserId, int $organizationId, int $userId): LaunchSessionDto
    {
        // No DB::transaction required here since it's a single insert, but good practice.
        return DB::transaction(function () use ($assessmentUuid, $candidateUserId, $organizationId, $userId) {
            $assessment = Assessment::where('uuid', $assessmentUuid)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$assessment) {
                throw new SessionLaunchException(SessionLaunchException::SESSION_NOT_FOUND, "Assessment not found or access denied.");
            }

            if (!$assessment->is_published || $assessment->current_state !== 'PUBLISHED') {
                throw new SessionLaunchException(SessionLaunchException::ASSESSMENT_NOT_PUBLISHED, "Cannot create session for non-published assessment.");
            }

            $candidate = User::where('id', $candidateUserId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$candidate) {
                throw new SessionLaunchException(SessionLaunchException::CANDIDATE_REQUIRED, "Candidate not found or access denied.");
            }

            $session = new AssessmentSession();
            $session->uuid = Str::uuid()->toString();
            $session->organization_id = $organizationId;
            $session->assessment_id = $assessment->id;
            $session->assessment_version_id = $assessment->versions()->latest()->first()->id ?? 1;
            // correction: snapshot is NOT created here. assessment_snapshot_id will remain null.
            $session->candidate_user_id = $candidate->id;
            $session->session_token = Str::random(32);
            $session->session_status = SessionStateMachine::STATE_DRAFT;
            $session->created_by = $userId;
            $session->save();

            $subscription = \App\Modules\Billing\Models\TenantSubscription::where('organization_id', $organizationId)
                ->whereIn('status', ['ACTIVE', 'TRIALING', 'PAST_DUE'])
                ->orderBy('created_date', 'desc')
                ->first();
            
            if ($subscription) {
                $subscription->assessments_used += 1;
                $subscription->save();
            }

            return new LaunchSessionDto($session->uuid);
        });
    }

    public function launchSession(string $sessionUuid, int $organizationId, int $userId): \App\Modules\Delivery\DTOs\RandomizationResultDto
    {
        return DB::transaction(function () use ($sessionUuid, $organizationId, $userId) {
            $session = AssessmentSession::where('uuid', $sessionUuid)
                ->where('organization_id', $organizationId)
                ->lockForUpdate() // Prevent concurrent launches
                ->first();

            if (!$session) {
                throw new SessionLaunchException(SessionLaunchException::SESSION_NOT_FOUND, "Session not found or access denied.");
            }

            $latestAttempt = $session->latestAttempt;

            // If there's an IN_PROGRESS attempt, just resume it.
            if ($latestAttempt && $latestAttempt->status === 'IN_PROGRESS') {
                $snapshot = $latestAttempt->assessmentSnapshot;
                return new \App\Modules\Delivery\DTOs\RandomizationResultDto(
                    $latestAttempt->uuid,
                    $snapshot ? $snapshot->uuid : '',
                    $latestAttempt->randomization_seed,
                    $snapshot ? $snapshot->snapshot_schema_version : '1.0',
                    (bool)$latestAttempt->question_order_json,
                    (bool)$latestAttempt->option_order_json,
                    $session->access_started_at ? $session->access_started_at->toIso8601String() : now()->toIso8601String(),
                    $latestAttempt->started_at ? $latestAttempt->started_at->toIso8601String() : null,
                    $latestAttempt->expires_at ? $latestAttempt->expires_at->toIso8601String() : null,
                    $snapshot ? $snapshot->snapshot_json : null
                );
            }

            // Re-validate Assessment
            $assessment = Assessment::find($session->assessment_id);
            if (!$assessment || !$assessment->is_published || $assessment->current_state !== 'PUBLISHED') {
                throw new SessionLaunchException(SessionLaunchException::ASSESSMENT_NOT_PUBLISHED, "Assessment is no longer published.");
            }

            // Check Max Attempts if they have a previous attempt
            if ($latestAttempt) {
                $publication = $assessment->activePublication;
                $maxAttempts = $publication ? $publication->max_attempts : 1;
                $attemptsUsed = $session->attempts()->count();
                
                if ($attemptsUsed >= $maxAttempts) {
                    throw new SessionLaunchException(SessionLaunchException::SESSION_NOT_FOUND, "Maximum number of attempts reached.");
                }
            }

            // Perform transition if necessary
            if ($session->session_status !== SessionStateMachine::STATE_LAUNCHED) {
                $this->stateMachine->transition($session->session_status, SessionStateMachine::STATE_LAUNCHED);
            }

            // Generate Snapshot
            $snapshot = $this->snapshotService->generate($assessment, $userId);
            if (!$snapshot) {
                throw new SessionLaunchException(SessionLaunchException::SNAPSHOT_GENERATION_FAILED, "Failed to generate snapshot.");
            }

            $candidate = User::find($session->candidate_user_id);

            // Execute Randomization BEFORE Attempt creation
            $randomizationData = $this->randomizationEngine->execute(
                $snapshot, 
                $assessment, 
                $session->uuid, 
                $candidate->uuid ?? ''
            );

            // Bind Snapshot to Session (keeps track of latest snapshot used)
            $session->assessment_snapshot_id = $snapshot->id;
            $session->session_status = SessionStateMachine::STATE_LAUNCHED;
            if (!$session->access_started_at) {
                $session->access_started_at = now();
            }
            $session->modified_by = $userId;
            $session->save();

            // Create Attempt (Persist Ordering & Seed)
            $attempt = $this->attemptService->createAttempt($session, $snapshot, $organizationId, $userId, $randomizationData);
            if (!$attempt) {
                throw new SessionLaunchException(SessionLaunchException::ATTEMPT_CREATION_FAILED, "Failed to create attempt.");
            }

            return new \App\Modules\Delivery\DTOs\RandomizationResultDto(
                $attempt->uuid,
                $snapshot->uuid,
                $randomizationData['seed'],
                $snapshot->snapshot_schema_version,
                $randomizationData['question_randomized'],
                $randomizationData['option_randomized'],
                $session->access_started_at->toIso8601String(),
                $attempt->started_at ? $attempt->started_at->toIso8601String() : null,
                $attempt->expires_at ? $attempt->expires_at->toIso8601String() : null,
                $snapshot->snapshot_json
            );
        });
    }
}
