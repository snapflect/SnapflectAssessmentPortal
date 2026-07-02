<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use App\Modules\Delivery\Services\ResumeEngineService;
use App\Modules\Delivery\Services\AttemptRecoveryService;
use App\Modules\Delivery\Services\DraftRecoveryService;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\DTOs\ResumeDto;
use App\Modules\Delivery\Exceptions\ResumeException;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Models\AttemptQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class ResumeEngineServiceTest extends TestCase
{
    use RefreshDatabase;

    private ResumeEngineService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $timerPolicy = new TimerPolicyHelper();
        $this->service = new ResumeEngineService(
            new AttemptRecoveryService($timerPolicy),
            new DraftRecoveryService(),
            $timerPolicy
        );

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
        $attempt->status = $overrides['status'] ?? 'CREATED';
        $attempt->started_at = Carbon::now()->subMinutes(10);
        $attempt->expires_at = $overrides['expires_at'] ?? Carbon::now()->addMinutes(60);
        
        $attempt->randomization_seed = 'seed';
        $attempt->question_order_json = $overrides['question_order_json'] ?? json_encode(['q-1', 'q-2']);
        $attempt->option_order_json = $overrides['option_order_json'] ?? json_encode(['q-1' => ['opt-1'], 'q-2' => ['opt-2']]);
        
        $attempt->save();
        
        return $attempt;
    }

    private function createAnswer(AssessmentAttempt $attempt, string $questionUuid)
    {
        $q = new AttemptQuestion();
        $q->id = random_int(1, 99999);
        $q->organization_id = 1;
        $q->assessment_attempt_id = $attempt->id;
        $q->attempt_section_id = 1;
        $q->snapshot_question_uuid = $questionUuid;
        $q->question_code = 'QC';
        $q->question_type = 'single_choice';
        $q->difficulty_level = 'easy';
        $q->display_order = 1;
        $q->save();

        $a = new CandidateAnswer();
        $a->uuid = Str::uuid()->toString();
        $a->organization_id = 1;
        $a->assessment_attempt_id = $attempt->id;
        $a->attempt_question_id = $q->id;
        $a->answer_type = 'single_choice';
        $a->selected_option_uuid = 'opt-x';
        $a->answer_version = 1;
        $a->saved_at = Carbon::now();
        $a->save();
    }

    public function test_resume_successful_and_idempotent()
    {
        $attempt = $this->createAttempt();
        $this->createAnswer($attempt, 'q-1');

        $dto = new ResumeDto($attempt->uuid);

        // Turn on query log
        DB::enableQueryLog();

        $result = $this->service->resumeAttempt($dto, 1, 1);
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        // Check it's READ ONLY
        foreach ($queries as $query) {
            $sql = strtolower($query['query']);
            $this->assertStringNotContainsString('insert', $sql);
            $this->assertStringNotContainsString('update', $sql);
            $this->assertStringNotContainsString('delete', $sql);
        }

        $this->assertEquals($attempt->uuid, $result->attemptUuid);
        $this->assertEquals(1, $result->answeredQuestions);
        $this->assertEquals(2, $result->totalQuestions);
        $this->assertEquals(50.0, $result->completionPercentage);
        $this->assertEquals(['q-1', 'q-2'], $result->questionOrder);
        
        // Assert idempotent - a second call yields exact same completion and read only state
        $result2 = $this->service->resumeAttempt($dto, 1, 1);
        $this->assertEquals($result->completionPercentage, $result2->completionPercentage);
    }

    public function test_expired_attempt_denied()
    {
        $attempt = $this->createAttempt(['status' => 'EXPIRED']);
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Cannot resume attempt in state: EXPIRED.');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_timer_expired_but_status_not_yet_updated_denied()
    {
        $attempt = $this->createAttempt(['expires_at' => Carbon::now()->subSeconds(10)]);
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('The attempt has expired and cannot be resumed.');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_randomization_count_mismatch()
    {
        $attempt = $this->createAttempt(['question_order_json' => json_encode(['q-1'])]); // Missing q-2
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Randomization integrity failed: Question count mismatch');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_randomization_duplicate_uuid()
    {
        $attempt = $this->createAttempt(['question_order_json' => json_encode(['q-1', 'q-1'])]);
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Randomization integrity failed: Duplicate question UUIDs');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_randomization_corrupted_option_mapping()
    {
        $attempt = $this->createAttempt(['option_order_json' => json_encode(['q-1' => ['invalid-opt']])]);
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Randomization integrity failed: Corrupted option mapping');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_snapshot_missing_schema_version()
    {
        $attempt = $this->createAttempt(['snapshot_schema_version' => null]);
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Required snapshot data is missing or incomplete.');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_orphan_draft_answer_denied()
    {
        $attempt = $this->createAttempt();
        // Create an answer for a question not in snapshot
        $this->createAnswer($attempt, 'orphaned-q');

        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Draft integrity failed: Draft references orphaned question UUID: orphaned-q');

        $this->service->resumeAttempt($dto, 1, 1);
    }

    public function test_cross_tenant_denial()
    {
        $attempt = $this->createAttempt();
        $dto = new ResumeDto($attempt->uuid);

        $this->expectException(ResumeException::class);
        $this->service->resumeAttempt($dto, 2, 1);
    }
}
