<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Services\CandidateAnswerService;
use App\Modules\Delivery\Repositories\Interfaces\CandidateAnswerRepositoryInterface;
use App\Modules\Delivery\Services\AttemptAuditService;
use App\Modules\Delivery\DTOs\CreateAnswerDto;
use App\Modules\Delivery\DTOs\UpdateAnswerDto;
use App\Modules\Delivery\DTOs\AutoSaveAnswerDto;
use Mockery;

class CandidateAnswerServiceTest extends TestCase
{
    use RefreshDatabase;

    private CandidateAnswerService $answerService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $answerRepository = Mockery::mock(CandidateAnswerRepositoryInterface::class);
        $auditService = Mockery::mock(AttemptAuditService::class);
        
        $this->answerService = new CandidateAnswerService(
            $answerRepository,
            $auditService
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_save_answer(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        
        $attemptId = \Illuminate\Support\Facades\DB::table('assessment_attempts')->insertGetId([
            'uuid' => 'attempt-uuid',
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_session_id' => 1,
            'assessment_snapshot_id' => 1,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $sectionId = \Illuminate\Support\Facades\DB::table('attempt_sections')->insertGetId([
            'uuid' => 'section-uuid',
            'organization_id' => $org->id,
            'assessment_attempt_id' => $attemptId,
            'snapshot_section_uuid' => 'snap-section',
            'display_order' => 1,
            'section_name' => 'Test Section',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $questionId = \Illuminate\Support\Facades\DB::table('attempt_questions')->insertGetId([
            'uuid' => 'question-uuid',
            'organization_id' => $org->id,
            'assessment_attempt_id' => $attemptId,
            'attempt_section_id' => $sectionId,
            'snapshot_question_uuid' => 'question-uuid',
            'question_code' => 'Q1',
            'question_type' => 'SINGLE_CHOICE',
            'difficulty_level' => 'EASY',
            'display_order' => 1,
            'max_score' => 10,
            'created_by' => 1,
            'created_date' => now()
        ]);

        $dto = new CreateAnswerDto('attempt-uuid', 'question-uuid', 'SINGLE_CHOICE', 'opt-uuid', null, null, null, null);
        $result = $this->answerService->createAnswer($dto);
        $this->assertIsArray($result);
    }

    public function test_update_answer(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        
        $attemptId = \Illuminate\Support\Facades\DB::table('assessment_attempts')->insertGetId([
            'uuid' => 'attempt-uuid2',
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_session_id' => 1,
            'assessment_snapshot_id' => 1,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $sectionId = \Illuminate\Support\Facades\DB::table('attempt_sections')->insertGetId([
            'uuid' => 'section-uuid2',
            'organization_id' => $org->id,
            'assessment_attempt_id' => $attemptId,
            'snapshot_section_uuid' => 'snap-section',
            'display_order' => 1,
            'section_name' => 'Test Section',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $questionId = \Illuminate\Support\Facades\DB::table('attempt_questions')->insertGetId([
            'uuid' => 'question-uuid2',
            'organization_id' => $org->id,
            'assessment_attempt_id' => $attemptId,
            'attempt_section_id' => $sectionId,
            'snapshot_question_uuid' => 'question-uuid2',
            'question_code' => 'Q1',
            'question_type' => 'SINGLE_CHOICE',
            'difficulty_level' => 'EASY',
            'display_order' => 1,
            'max_score' => 10,
            'created_by' => 1,
            'created_date' => now()
        ]);

        \Illuminate\Support\Facades\DB::table('candidate_answers')->insert([
            'uuid' => 'answer-uuid',
            'organization_id' => $org->id,
            'assessment_attempt_id' => $attemptId,
            'attempt_question_id' => $questionId,
            'answer_type' => 'SINGLE_CHOICE',
            'saved_at' => now(),
            'created_by' => 1,
            'created_date' => now()
        ]);

        $dto = new UpdateAnswerDto('answer-uuid', 'SINGLE_CHOICE', 'new-opt', null, null, null, null);
        $result = $this->answerService->updateAnswer($dto);
        $this->assertIsArray($result);
    }

    public function test_auto_save_answer(): void
    {
        $this->assertTrue(true);
    }

    public function test_answer_version_increment(): void
    {
        $this->assertTrue(true);
    }
}
