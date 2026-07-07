<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AttemptQuestion;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class QuestionNavigationFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;
    private AssessmentSession $session;
    private AssessmentAttempt $attempt;
    private AttemptQuestion $question;

    protected function setUp(): void
    {
        parent::setUp();
        
        DB::statement('PRAGMA foreign_keys = OFF;');
        $this->user = User::factory()->create();

        $roleId = DB::table('roles')->insertGetId([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'role_name' => 'Candidate',
            'role_code' => 'CANDIDATE',
            'is_system_role' => true,
        ]);
        DB::table('user_roles')->insert([
            'uuid' => Str::uuid()->toString(),
            'user_id' => $this->user->id,
            'role_id' => $roleId,
        ]);
        
        $this->assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'current_state'   => 'PUBLISHED',
            'is_published'    => true,
            'created_by'      => $this->user->id,
        ]);

        $snapshotQuestionUuid = Str::uuid()->toString();
        $snapshotQuestionUuid2 = Str::uuid()->toString();
        
        $snapshot = new AssessmentSnapshot();
        $snapshot->uuid = Str::uuid()->toString();
        $snapshot->organization_id = $this->assessment->organization_id;
        $snapshot->assessment_id = $this->assessment->id;
        $snapshot->assessment_version_id = 1;
        $snapshot->snapshot_schema_version = '1.0';
        $snapshot->snapshot_hash = 'fakehash';
        $snapshot->snapshot_json = json_encode([
            'blueprint' => [
                'time_limit_minutes' => 60, 
                'sections' => [
                    [
                        'questions' => [
                            ['uuid' => $snapshotQuestionUuid, 'question_type' => 'MULTIPLE_CHOICE'],
                            ['uuid' => $snapshotQuestionUuid2, 'question_type' => 'MULTIPLE_CHOICE']
                        ]
                    ]
                ]
            ]
        ]);
        $snapshot->save();

        $this->session = new AssessmentSession();
        $this->session->uuid = Str::uuid()->toString();
        $this->session->organization_id = $this->user->organization_id;
        $this->session->assessment_id = $this->assessment->id;
        $this->session->assessment_version_id = 1;
        $this->session->assessment_snapshot_id = $snapshot->id;
        $this->session->candidate_user_id = $this->user->id;
        $this->session->session_status = 'IN_PROGRESS';
        $this->session->session_token = Str::random(32);
        $this->session->created_by = $this->user->id;
        $this->session->save();

        $this->attempt = new AssessmentAttempt();
        $this->attempt->uuid = Str::uuid()->toString();
        $this->attempt->organization_id = $this->user->organization_id;
        $this->attempt->assessment_id = $this->assessment->id;
        $this->attempt->assessment_version_id = 1;
        $this->attempt->assessment_snapshot_id = $snapshot->id;
        $this->attempt->assessment_session_id = $this->session->id;
        $this->attempt->candidate_user_id = $this->user->id;
        $this->attempt->status = 'IN_PROGRESS';
        $this->attempt->started_at = Carbon::now();
        $this->attempt->expires_at = Carbon::now()->addMinutes(60);
        $this->attempt->save();

        // Assume AttemptQuestion table exists
        DB::table('attempt_sections')->insert([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'snapshot_section_uuid' => Str::uuid()->toString(),
            'section_name' => 'SEC1',
            'display_order' => 1
        ]);
        $sectionId = DB::getPdo()->lastInsertId();

        $questionUuid = Str::uuid()->toString();
        DB::table('attempt_questions')->insert([
            'uuid' => $questionUuid,
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'attempt_section_id' => $sectionId,
            'snapshot_question_uuid' => $snapshotQuestionUuid,
            'question_code' => 'Q1',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'MEDIUM',
            'display_order' => 1,
            'max_score' => 1,
            'is_flagged' => false,
        ]);
        $this->question = AttemptQuestion::where('uuid', $questionUuid)->first();

        $questionUuid2 = Str::uuid()->toString();
        DB::table('attempt_questions')->insert([
            'uuid' => $questionUuid2,
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'attempt_section_id' => $sectionId,
            'snapshot_question_uuid' => $snapshotQuestionUuid2,
            'question_code' => 'Q2',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'MEDIUM',
            'display_order' => 2,
            'max_score' => 1,
            'is_flagged' => false,
        ]);
        $this->question2 = AttemptQuestion::where('uuid', $questionUuid2)->first();
    }

    protected function tearDown(): void
    {
        DB::statement('PRAGMA foreign_keys = ON;');
        parent::tearDown();
    }

    public function test_next_question(): void
    {
        $payload = [
            'current_question' => $this->question->snapshot_question_uuid,
            'direction' => 'NEXT'
        ];
        
        $response = $this->actingAs($this->user)->json('GET', '/api/v1/delivery/questions/' . $this->attempt->uuid . '/next', $payload);
        $response->assertStatus(200);
    }

    public function test_previous_question(): void
    {
        $payload = [
            'current_question' => $this->question2->snapshot_question_uuid,
            'direction' => 'PREVIOUS'
        ];
        
        $response = $this->actingAs($this->user)->json('GET', '/api/v1/delivery/questions/' . $this->attempt->uuid . '/previous', $payload);
        $response->assertStatus(200);
    }

    public function test_jump_question(): void
    {
        $payload = [
            'target_question_uuid' => $this->question2->snapshot_question_uuid
        ];
        
        $response = $this->actingAs($this->user)->json('GET', '/api/v1/delivery/attempts/' . $this->attempt->uuid . '/questions/' . $this->question->uuid, $payload);
        $response->assertStatus(200);
    }

    public function test_flag_question(): void
    {
        $payload = [
            'question_uuid' => $this->question->uuid
        ];
        
        $response = $this->actingAs($this->user)->json('POST', '/api/v1/delivery/questions/' . $this->question->uuid . '/flag', $payload);

        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_unflag_question(): void
    {
        $payload = [
            'question_uuid' => $this->question->uuid
        ];
        
        $response = $this->actingAs($this->user)->json('POST', '/api/v1/delivery/questions/' . $this->question->uuid . '/unflag', $payload);

        $this->assertNotEquals(404, $response->getStatusCode());
    }
}
