<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Exceptions\AssessmentPublicationException;
use App\Modules\Assessment\DTOs\PublicationResultDto;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Modules\Security\Models\User;

class AssessmentPublicationService
{
    public function __construct(
        private readonly AssessmentRepositoryInterface $assessmentRepository,
        private readonly AssessmentValidationService $validationService,
        private readonly PublicationStateMachine $stateMachine
    ) {
    }

    public function makeReady(string $assessmentUuid, int $organizationId, int $userId): PublicationResultDto
    {
        return DB::transaction(function () use ($assessmentUuid, $organizationId, $userId) {
            $assessment = $this->assessmentRepository->query()
                ->where('uuid', $assessmentUuid)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$assessment) {
                throw new AssessmentPublicationException(AssessmentPublicationException::INVALID_TRANSITION, "Assessment not found or access denied.");
            }

            $currentStatus = $assessment->current_state ?? PublicationStateMachine::STATE_DRAFT;
            $targetStatus = PublicationStateMachine::STATE_APPROVED;

            if ($currentStatus === $targetStatus) {
                return $this->createResultDto($assessmentUuid, $currentStatus, $targetStatus, $userId);
            }

            $this->stateMachine->transition($currentStatus, $targetStatus);

            $validationResult = $this->validationService->validate($assessmentUuid, $organizationId, $userId);
            if (!$validationResult->readyForPublication) {
                $errorMessages = array_map(fn($e) => $e->message, $validationResult->validationErrors);
                throw new AssessmentPublicationException(AssessmentPublicationException::VALIDATION_REQUIRED, "Assessment failed validation and cannot be approved. Please fix the following errors: \n" . implode("\n", $errorMessages), $validationResult->validationErrors);
            }

            $this->assessmentRepository->update($assessment->id, [
                'current_state' => $targetStatus
            ]);

            return $this->createResultDto($assessmentUuid, $currentStatus, $targetStatus, $userId);
        });
    }

    public function publish(string $assessmentUuid, array $schedulingData, int $organizationId, int $userId): PublicationResultDto
    {
        return DB::transaction(function () use ($assessmentUuid, $schedulingData, $organizationId, $userId) {
            $assessment = $this->assessmentRepository->query()
                ->where('uuid', $assessmentUuid)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$assessment) {
                throw new AssessmentPublicationException(AssessmentPublicationException::INVALID_TRANSITION, "Assessment not found or access denied.");
            }

            $currentStatus = $assessment->current_state ?? PublicationStateMachine::STATE_DRAFT;
            $targetStatus = PublicationStateMachine::STATE_PUBLISHED;

            if ($currentStatus !== $targetStatus) {
                $this->stateMachine->transition($currentStatus, $targetStatus);

                // Revalidate before publish (Correction 4)
                $validationResult = $this->validationService->validate($assessmentUuid, $organizationId, $userId);
                if (!$validationResult->readyForPublication) {
                    $errorMessages = array_map(fn($e) => $e->message, $validationResult->validationErrors);
                    throw new AssessmentPublicationException(AssessmentPublicationException::ASSESSMENT_NOT_READY, "Assessment validation failed. Please fix the following errors before publishing: \n" . implode("\n", $errorMessages), $validationResult->validationErrors);
                }

                $this->assessmentRepository->update($assessment->id, [
                    'current_state' => $targetStatus,
                    'is_published' => true
                ]);
            }

            // For MVP, we mock the creation of snapshot/version here if the logic wasn't fully built yet.
            // Ideally this would call a SnapshotService.
            $version = DB::table('assessment_versions')->where('assessment_id', $assessment->id)->first();
            if (!$version) {
                $versionId = DB::table('assessment_versions')->insertGetId([
                    'uuid' => (string) \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organizationId,
                    'assessment_id' => $assessment->id,
                    'major_version' => 1,
                    'minor_version' => 0,
                    'version_label' => '1.0',
                    'created_by' => $userId,
                    'created_date' => Carbon::now()
                ]);
            } else {
                $versionId = $version->id;
            }

            $snapshot = DB::table('assessment_snapshots')->where('assessment_id', $assessment->id)->first();
            if (!$snapshot) {
                $snapshotId = DB::table('assessment_snapshots')->insertGetId([
                    'uuid' => (string) \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organizationId,
                    'assessment_id' => $assessment->id,
                    'assessment_version_id' => $versionId,
                    'snapshot_json' => json_encode(['mock' => 'data']),
                    'snapshot_hash' => md5('mock'),
                    'published_by' => $userId,
                    'published_date' => Carbon::now(),
                    'created_by' => $userId,
                    'created_date' => Carbon::now()
                ]);
            } else {
                $snapshotId = $snapshot->id;
            }

            $pubRepo = app(\App\Modules\Assessment\Repositories\Interfaces\PublicationRepositoryInterface::class);
            $publication = $pubRepo->create([
                'assessment_id' => $assessment->id,
                'assessment_version_id' => $versionId,
                'assessment_snapshot_id' => $snapshotId,
                'publication_code' => $schedulingData['publication_code'] ?? 'PUB-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'title' => $schedulingData['title'] ?? $assessment->assessment_name . ' Publication',
                'start_date' => $schedulingData['start_date'] ?? \Carbon\Carbon::now(),
                'end_date' => $schedulingData['end_date'] ?? null,
                'max_attempts' => $schedulingData['max_attempts'] ?? 1,
                'is_proctored' => $schedulingData['is_proctored'] ?? false,
                'published_by' => $userId,
                'published_date' => Carbon::now(),
                'status' => 'SCHEDULED', // Simple logic for MVP
                'created_by' => $userId
            ]);

            // Assign Candidates
            if (isset($schedulingData['candidate_emails']) && is_array($schedulingData['candidate_emails'])) {
                $candidateEmails = array_unique(array_filter($schedulingData['candidate_emails']));
                $candidateRole = \DB::table('roles')->where('role_code', 'CANDIDATE')->first();
                $roleId = $candidateRole ? $candidateRole->id : 5; // fallback to 5 (Candidate)

                foreach ($candidateEmails as $email) {
                    $email = strtolower(trim($email));
                    $user = \App\Models\User::where('email', $email)->first();
                    if (!$user) {
                        $user = \App\Models\User::create([
                            'email' => $email,
                            'first_name' => explode('@', $email)[0],
                            'last_name' => 'Candidate',
                            'password' => \Hash::make(\Illuminate\Support\Str::random(12)),
                            'organization_id' => $organizationId
                        ]);

                        \DB::table('user_roles')->insert([
                            'uuid' => (string) \Illuminate\Support\Str::uuid(),
                            'user_id' => $user->id,
                            'role_id' => $roleId,
                            'created_by' => $userId,
                            'created_date' => \Carbon\Carbon::now()
                        ]);
                    }

                    \DB::table('publication_candidates')->insert([
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'publication_id' => $publication->id,
                        'candidate_id' => $user->id,
                        'status' => 'ASSIGNED',
                        'created_by' => $userId,
                        'created_date' => Carbon::now()
                    ]);
                }
            }

            return $this->createResultDto($assessmentUuid, $currentStatus, $targetStatus, $userId);
        });
    }

    public function archive(string $assessmentUuid, int $organizationId, int $userId): PublicationResultDto
    {
        return DB::transaction(function () use ($assessmentUuid, $organizationId, $userId) {
            $assessment = $this->assessmentRepository->query()
                ->where('uuid', $assessmentUuid)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$assessment) {
                throw new AssessmentPublicationException(AssessmentPublicationException::INVALID_TRANSITION, "Assessment not found or access denied.");
            }

            $currentStatus = $assessment->current_state ?? PublicationStateMachine::STATE_DRAFT;
            $targetStatus = PublicationStateMachine::STATE_ARCHIVED;

            if ($currentStatus === $targetStatus) {
                return $this->createResultDto($assessmentUuid, $currentStatus, $targetStatus, $userId);
            }

            $this->stateMachine->transition($currentStatus, $targetStatus);

            $this->assessmentRepository->update($assessment->id, [
                'current_state' => $targetStatus,
                'is_published' => false
            ]);

            return $this->createResultDto($assessmentUuid, $currentStatus, $targetStatus, $userId);
        });
    }

    private function createResultDto(string $uuid, string $previous, string $current, int $userId): PublicationResultDto
    {
        // Fetch user UUID for DTO (Correction 2)
        $userUuid = '';
        $user = User::find($userId);
        if ($user) {
            $userUuid = $user->uuid;
        }

        return new PublicationResultDto(
            $uuid,
            $previous,
            $current,
            Carbon::now()->toIso8601String(),
            $userUuid
        );
    }
}
