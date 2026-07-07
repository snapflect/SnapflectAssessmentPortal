<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Delivery\Repositories\Eloquent\CandidateAnswerRepository;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Models\AttemptQuestion;
use App\Modules\Delivery\Models\AttemptSection;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentSnapshot;

class CandidateAnswerRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected CandidateAnswerRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new CandidateAnswerRepository();
    }

    protected function createAnswer(array $overrides = []): CandidateAnswer
    {
        $assessment = Assessment::factory()->create();
        $version = AssessmentVersion::create([
            'assessment_id' => $assessment->id,
            'major_version' => 1,
            'minor_version' => 0,
            'version_label' => '1.0',
            'organization_id' => $assessment->organization_id,
        ]);

        $snapshot = AssessmentSnapshot::create([
            'organization_id' => $assessment->organization_id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => $version->id,
            'snapshot_json' => '{}',
            'snapshot_hash' => 'hash',
        ]);

        $session = AssessmentSession::create([
            'organization_id' => $assessment->organization_id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => $version->id,
            'candidate_user_id' => 1,
            'session_token' => $this->faker->uuid,
            'session_status' => 'ACTIVE',
        ]);

        $attempt = AssessmentAttempt::create([
            'organization_id' => $assessment->organization_id,
            'assessment_session_id' => $session->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => $version->id,
            'assessment_snapshot_id' => $snapshot->id,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'attempt_number' => 1,
        ]);

        $section = AttemptSection::create([
            'organization_id' => $assessment->organization_id,
            'assessment_attempt_id' => $attempt->id,
            'section_uuid' => $this->faker->uuid,
            'section_name' => 'General',
            'display_order' => 1,
        ]);

        $question = AttemptQuestion::create([
            'organization_id' => $assessment->organization_id,
            'assessment_attempt_id' => $attempt->id,
            'attempt_section_id' => $section->id,
            'question_uuid' => $this->faker->uuid,
            'question_code' => 'Q001',
            'snapshot_question_uuid' => $this->faker->uuid,
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'MEDIUM',
            'display_order' => 1,
            'max_score' => 1,
        ]);

        $data = array_merge([
            'organization_id' => $assessment->organization_id,
            'assessment_attempt_id' => $attempt->id,
            'attempt_question_id' => $question->id,
            'answer_version' => 1,
            'answer_type' => 'MULTIPLE_CHOICE',
            'is_final_answer' => false,
            'text_answer' => 'Test answer',
            'saved_at' => \Illuminate\Support\Carbon::now(),
        ], $overrides);

        return $this->repository->create($data);
    }

    public function test_find_by_uuid(): void
    {
        $answer = $this->createAnswer();
        
        $found = $this->repository->findByUuid($answer->uuid);
        $this->assertNotNull($found);
        $this->assertEquals($answer->id, $found->id);
    }

    public function test_find_by_attempt(): void
    {
        $answer = $this->createAnswer();
        
        $results = $this->repository->findByAttempt($answer->assessment_attempt_id);
        $this->assertCount(1, $results);
    }

    public function test_find_latest_answer(): void
    {
        $answer1 = $this->createAnswer(['answer_version' => 1]);
        $answer2 = $this->repository->create([
            'organization_id' => $answer1->organization_id,
            'assessment_attempt_id' => $answer1->assessment_attempt_id,
            'attempt_question_id' => $answer1->attempt_question_id,
            'answer_version' => 2,
            'answer_type' => 'MULTIPLE_CHOICE',
            'is_final_answer' => false,
            'text_answer' => 'Updated answer',
            'saved_at' => \Illuminate\Support\Carbon::now(),
        ]);
        
        $latest = $this->repository->findLatestAnswer($answer1->assessment_attempt_id, $answer1->attempt_question_id);
        $this->assertNotNull($latest);
        $this->assertEquals(2, $latest->answer_version);
    }

    public function test_create_and_update(): void
    {
        $answer = $this->createAnswer();
        
        $this->repository->update($answer, ['is_final_answer' => true]);
        
        $updated = $this->repository->findById($answer->id);
        $this->assertTrue((bool)$updated->is_final_answer);
    }
}
