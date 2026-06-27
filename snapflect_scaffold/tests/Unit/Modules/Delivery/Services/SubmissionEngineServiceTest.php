<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use App\Modules\Delivery\Services\SubmissionEngineService;
use App\Modules\Delivery\Services\SubmissionValidationService;
use App\Modules\Delivery\Services\AttemptFinalizationService;
use App\Modules\Delivery\Services\AttemptRecoveryService;
use App\Modules\Delivery\Services\DraftRecoveryService;
use App\Modules\Delivery\Services\ResumeEngineService;
use App\Modules\Delivery\Services\AutoSaveService;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use App\Modules\Delivery\DTOs\ResumeDto;
use App\Modules\Delivery\DTOs\AutoSaveDto;
use App\Modules\Delivery\Exceptions\SubmissionException;
use App\Modules\Delivery\Exceptions\ResumeException;
use App\Modules\Delivery\Exceptions\AutoSaveException;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\AttemptSubmission;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Models\AttemptQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class SubmissionEngineServiceTest extends TestCase
{
    use RefreshDatabase;

    private SubmissionEngineService $submissionService;
    private ResumeEngineService $resumeService;
    private AutoSaveService $autoSaveService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $timerPolicy = new TimerPolicyHelper();
        $this->submissionService = new SubmissionEngineService(
            new SubmissionValidationService($timerPolicy),
            new AttemptFinalizationService()
        );

        $this->resumeService = new ResumeEngineService(
            new AttemptRecoveryService($timerPolicy),
            new DraftRecoveryService(),
            $timerPolicy
        );

        $this->autoSaveService = new AutoSaveService($timerPolicy);

        \Illuminate\Support\Facades\Config::set('assessment.grace_period_seconds', 0);
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    }

    protected function tearDown(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        parent::tearDown();
    }

    private function getValidSnapshotPayload(): array
    {
        return [
            'blueprint' => [
                'sections' => [
                    [
                        'uuid' => 'sec-1',
                        'questions' => [
                            ['uuid' => 'q-1', 'options' => [['uuid' => 'opt-1']]],
                            ['uuid' => 'q-2', 'options' => [['uuid' => 'opt-2']]]
                        ]
                    ]
                ]
            ]
        ];
    }

    private function createAttempt(array $overrides = []): AssessmentAttempt
    {
        $snapshot = new AssessmentSnapshot();
        $snapshot->id = 1;
        $snapshot->uuid = Str::uuid()->toString();
        $snapshot->organization_id = 1;
        $snapshot->assessment_id = 1;
        $snapshot->assessment_version_id = 1;
        $snapshot->snapshot_json = $overrides['snapshot_json'] ?? json_encode($this->getValidSnapshotPayload());
        $snapshot->snapshot_hash = $overrides['snapshot_hash'] ?? 'fakehash';
        $snapshot->snapshot_schema_version = $overrides['snapshot_schema_version'] ?? '1.0';
        $snapshot->status = 'ACTIVE';
        $snapshot->save();

        $attempt = new AssessmentAttempt();
        $attempt->uuid = Str::uuid()->toString();
        $attempt->organization_id = 1;
        $attempt->assessment_session_id = 1;
        $attempt->assessment_id = 1;
        $attempt->assessment_version_id = 1;
        $attempt->assessment_snapshot_id = $snapshot->id;
        $attempt->candidate_user_id = 1;
        $attempt->status = $overrides['status'] ?? 'IN_PROGRESS';
        $attempt->started_at = Carbon::now()->subMinutes(10);
        $attempt->expires_at = $overrides['expires_at'] ?? Carbon::now('UTC')->addMinutes(60);
        
        $attempt->randomization_seed = 'seed';
        $attempt->question_order_json = $overrides['question_order_json'] ?? json_encode(['q-1', 'q-2']);
        $attempt->option_order_json = $overrides['option_order_json'] ?? json_encode(['q-1' => ['opt-1'], 'q-2' => ['opt-2']]);
        
        $attempt->save();
        
        return $attempt;
    }

    public function test_submission_successful_and_evidence_created()
    {
        $attempt = $this->createAttempt();
        $dto = new SubmitAttemptDto($attempt->uuid);

        $result = $this->submissionService->submitAttempt($dto, 1, 1);

        $this->assertEquals('SUBMITTED', $result->finalStatus);
        $this->assertEquals(0, $result->answeredQuestions);
        $this->assertEquals(2, $result->totalQuestions);
        $this->assertEquals(0.0, $result->completionPercentage);
        
        $this->assertDatabaseHas('assessment_attempts', [
            'id' => $attempt->id,
            'status' => 'SUBMITTED'
        ]);

        $this->assertDatabaseHas('attempt_submissions', [
            'assessment_attempt_id' => $attempt->id,
            'submission_type' => 'EXPLICIT',
            'total_answered' => 0,
            'total_unanswered' => 2
        ]);
    }

    public function test_idempotent_duplicate_submit_returns_identical_dto()
    {
        $attempt = $this->createAttempt();
        $dto = new SubmitAttemptDto($attempt->uuid);

        $result1 = $this->submissionService->submitAttempt($dto, 1, 1);
        
        DB::enableQueryLog();
        $result2 = $this->submissionService->submitAttempt($dto, 1, 1);
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        // Ensure returned state is identical
        $this->assertEquals($result1->submittedAt, $result2->submittedAt);
        
        // Ensure no DB queries (except the select query to load attempt)
        $writeQueries = array_filter($queries, function($q) {
            return str_contains(strtolower($q['query']), 'insert') || str_contains(strtolower($q['query']), 'update');
        });
        
        $this->assertEmpty($writeQueries, 'No write queries should execute on duplicate submission.');
    }

    public function test_expired_attempt_auto_finalized()
    {
        $attempt = $this->createAttempt(['expires_at' => Carbon::now('UTC')->subMinutes(5)]);
        $dto = new SubmitAttemptDto($attempt->uuid);

        $result = $this->submissionService->submitAttempt($dto, 1, 1);

        $this->assertDatabaseHas('attempt_submissions', [
            'assessment_attempt_id' => $attempt->id,
            'submission_type' => 'AUTO_FINALIZED',
        ]);
    }

    public function test_cancelled_attempt_denied()
    {
        $attempt = $this->createAttempt(['status' => 'CANCELLED']);
        $dto = new SubmitAttemptDto($attempt->uuid);

        $this->expectException(SubmissionException::class);
        $this->expectExceptionMessage('Cannot submit attempt in state: CANCELLED.');
        
        $this->submissionService->submitAttempt($dto, 1, 1);
    }

    public function test_snapshot_validation_failure()
    {
        $attempt = $this->createAttempt(['snapshot_schema_version' => null]);
        $dto = new SubmitAttemptDto($attempt->uuid);

        $this->expectException(SubmissionException::class);
        $this->expectExceptionMessage('Required snapshot data is missing or corrupted.');
        
        $this->submissionService->submitAttempt($dto, 1, 1);
    }

    public function test_randomization_corruption_failure()
    {
        $attempt = $this->createAttempt(['question_order_json' => json_encode(['q-1', 'q-1'])]); // duplicate
        $dto = new SubmitAttemptDto($attempt->uuid);

        $this->expectException(SubmissionException::class);
        $this->expectExceptionMessage('Randomization validation failed: Duplicate question UUIDs found in randomization.');
        
        $this->submissionService->submitAttempt($dto, 1, 1);
    }

    public function test_resume_denied_after_submission()
    {
        $attempt = $this->createAttempt();
        $this->submissionService->submitAttempt(new SubmitAttemptDto($attempt->uuid), 1, 1);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Cannot resume attempt in state: SUBMITTED.');

        $this->resumeService->resumeAttempt(new ResumeDto($attempt->uuid), 1, 1);
    }

    public function test_auto_save_denied_after_submission()
    {
        $attempt = $this->createAttempt();
        $this->submissionService->submitAttempt(new SubmitAttemptDto($attempt->uuid), 1, 1);

        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('Cannot save. Attempt is already submitted.');

        $this->autoSaveService->executeSave(new AutoSaveDto($attempt->uuid, 'q-1', 'A', '1'), 1, 1);
    }
}
