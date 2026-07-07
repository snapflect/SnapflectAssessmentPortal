<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use App\Modules\Delivery\Services\AutoSaveService;
use App\Modules\Delivery\DTOs\AutoSaveDto;
use App\Modules\Delivery\Exceptions\AutoSaveException;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Models\AttemptSection;
use App\Modules\Delivery\Models\AttemptQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class AutoSaveServiceTest extends TestCase
{
    use RefreshDatabase;

    private AutoSaveService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AutoSaveService(new TimerPolicyHelper());
        \Illuminate\Support\Facades\Config::set('assessment.grace_period_seconds', 0);
        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = OFF;');
    }

    protected function tearDown(): void
    {
        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = ON;');
        parent::tearDown();
    }

    private function getMockSnapshotPayload(): array
    {
        return [
            'blueprint' => [
                'sections' => [
                    [
                        'uuid' => 'sec-1',
                        'questions' => [
                            ['uuid' => 'q-1', 'question_type' => 'single_choice'],
                            ['uuid' => 'q-2', 'question_type' => 'multiple_choice'],
                            ['uuid' => 'q-3', 'question_type' => 'essay'],
                            ['uuid' => 'q-4', 'question_type' => 'numeric']
                        ]
                    ]
                ]
            ]
        ];
    }

    private function createAttempt(string $status = 'STARTED', ?Carbon $expiresAt = null): AssessmentAttempt
    {
        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = OFF;');

        $snapshot = new AssessmentSnapshot();
        $snapshot->id = 1;
        $snapshot->uuid = Str::uuid()->toString();
        $snapshot->organization_id = 1;
        $snapshot->assessment_id = 1;
        $snapshot->assessment_version_id = 1;
        $snapshot->snapshot_json = json_encode($this->getMockSnapshotPayload());
        $snapshot->snapshot_hash = 'fakehash';
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
        $attempt->status = $status;
        $attempt->started_at = Carbon::now()->subMinutes(10);
        $attempt->expires_at = $expiresAt ?? Carbon::now()->addMinutes(60);
        $attempt->save();

        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = ON;');

        return $attempt;
    }

    public function test_answer_saved_successfully_lazy_materialization()
    {
        $attempt = $this->createAttempt();
        $optUuid = Str::uuid()->toString();
        $dto = new AutoSaveDto(
            $attempt->uuid,
            'q-1',
            $optUuid,
            '1'
        );
        $result = $this->service->executeSave($dto, 1, 1);

        $this->assertTrue($result->success);
        
        // Assert candidate answer created
        $this->assertDatabaseHas('candidate_answers', [
            'uuid' => $result->answerUuid,
            'answer_version' => 1,
            'selected_option_uuid' => $optUuid
        ]);

        // Assert attempt_questions and attempt_sections were lazy materialized
        $this->assertDatabaseHas('attempt_sections', [
            'assessment_attempt_id' => $attempt->id,
            'snapshot_section_uuid' => 'sec-1'
        ]);

        $this->assertDatabaseHas('attempt_questions', [
            'assessment_attempt_id' => $attempt->id,
            'snapshot_question_uuid' => 'q-1'
        ]);
    }

    public function test_multiple_choice_save()
    {
        $attempt = $this->createAttempt();
        $dto = new AutoSaveDto($attempt->uuid, 'q-2', ['opt-1', 'opt-2'], '1');

        $result = $this->service->executeSave($dto, 1, 1);
        
        $answer = CandidateAnswer::where('uuid', $result->answerUuid)->first();
        $this->assertEquals('multiple_choice', $answer->answer_type);
        $this->assertNotNull($answer->selected_option_uuids_json);
        $this->assertEquals(json_encode(['opt-1', 'opt-2']), $answer->selected_option_uuids_json);
    }

    public function test_essay_save()
    {
        $attempt = $this->createAttempt();
        $dto = new AutoSaveDto($attempt->uuid, 'q-3', 'This is an essay.', '1');

        $result = $this->service->executeSave($dto, 1, 1);
        
        $answer = CandidateAnswer::where('uuid', $result->answerUuid)->first();
        $this->assertEquals('essay', $answer->answer_type);
        $this->assertEquals('This is an essay.', $answer->text_answer);
    }

    public function test_numeric_save()
    {
        $attempt = $this->createAttempt();
        $dto = new AutoSaveDto($attempt->uuid, 'q-4', 42.5, '1');

        $result = $this->service->executeSave($dto, 1, 1);
        
        $answer = CandidateAnswer::where('uuid', $result->answerUuid)->first();
        $this->assertEquals('numeric', $answer->answer_type);
        $this->assertEquals(42.5, $answer->numeric_answer);
    }

    public function test_latest_successful_save_wins_optimistic_concurrency()
    {
        $attempt = $this->createAttempt();
        
        // Save Version 1
        $dtoV1 = new AutoSaveDto($attempt->uuid, 'q-1', 'A', '1');
        $this->service->executeSave($dtoV1, 1, 1);

        // Save Version 3
        $dtoV3 = new AutoSaveDto($attempt->uuid, 'q-1', 'C', '3');
        $this->service->executeSave($dtoV3, 1, 1);

        // Attempt Save Version 2 (Stale payload arriving late)
        $dtoV2 = new AutoSaveDto($attempt->uuid, 'q-1', 'B', '2');
        
        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('The provided draft version is stale.');
        
        $this->service->executeSave($dtoV2, 1, 1);
    }

    public function test_duplicate_save_same_version_denied()
    {
        $attempt = $this->createAttempt();
        $dto = new AutoSaveDto($attempt->uuid, 'q-1', 'A', '1');
        $this->service->executeSave($dto, 1, 1);

        $this->expectException(AutoSaveException::class);
        $this->service->executeSave($dto, 1, 1); // Same version 1
    }

    public function test_question_missing_from_snapshot()
    {
        $attempt = $this->createAttempt();
        $dto = new AutoSaveDto($attempt->uuid, 'invalid-uuid-tampering', 'A', '1');
        
        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('The requested question does not exist in the attempt snapshot.');

        $this->service->executeSave($dto, 1, 1);
    }

    public function test_timer_integration_expiration_failure()
    {
        // Expires 1 second ago
        $attempt = $this->createAttempt('STARTED', Carbon::now()->subSeconds(1));
        $dto = new AutoSaveDto($attempt->uuid, 'q-1', 'A', '1');

        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('Timer has expired. Save denied.');

        $this->service->executeSave($dto, 1, 1);
        
        // Ensure state flipped to EXPIRED via auto-save calling timer logic
        $dbAttempt = AssessmentAttempt::find($attempt->id);
        $this->assertEquals('EXPIRED', $dbAttempt->status);
    }

    public function test_submitted_attempt_denied()
    {
        $attempt = $this->createAttempt('SUBMITTED');
        $dto = new AutoSaveDto($attempt->uuid, 'q-1', 'A', '1');

        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('Cannot save. Attempt is already submitted.');

        $this->service->executeSave($dto, 1, 1);
    }

    public function test_cross_tenant_denial()
    {
        $attempt = $this->createAttempt();
        $dto = new AutoSaveDto($attempt->uuid, 'q-1', 'A', '1');

        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('Attempt not found or access denied.');

        $this->service->executeSave($dto, 2, 1); // Wrong org ID
    }
}

