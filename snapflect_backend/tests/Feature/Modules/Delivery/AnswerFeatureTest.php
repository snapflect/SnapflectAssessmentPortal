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
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AnswerFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;
    private AssessmentSession $session;
    private AssessmentAttempt $attempt;
    private CandidateAnswer $answer;

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

        $snapshot = new AssessmentSnapshot();
        $snapshot->uuid = Str::uuid()->toString();
        $snapshot->organization_id = $this->assessment->organization_id;
        $snapshot->assessment_id = $this->assessment->id;
        $snapshot->assessment_version_id = 1;
        $snapshot->snapshot_schema_version = '1.0';
        $snapshot->snapshot_hash = 'fakehash';
        $snapshot->snapshot_json = json_encode(['blueprint' => ['time_limit_minutes' => 60, 'sections' => []]]);
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

        $this->answer = new CandidateAnswer();
        DB::table('attempt_sections')->insert([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'snapshot_section_uuid' => Str::uuid()->toString(),
            'section_name' => 'SEC1',
            'display_order' => 1
        ]);
        $sectionId = DB::getPdo()->lastInsertId();

        DB::table('attempt_questions')->insert([
            'uuid' => $questionUuid = Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'attempt_section_id' => $sectionId,
            'snapshot_question_uuid' => Str::uuid()->toString(),
            'question_code' => 'Q1',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'MEDIUM',
            'display_order' => 1,
            'max_score' => 1,
            'is_flagged' => false,
        ]);
        $this->answer->uuid = Str::uuid()->toString();
        $this->answer->organization_id = $this->user->organization_id;
        $this->answer->assessment_attempt_id = $this->attempt->id;
        $this->answer->attempt_question_id = DB::getPdo()->lastInsertId();
        $this->answer->answer_type = 'MULTIPLE_CHOICE';
        $this->answer->answer_json = json_encode(['selected' => ['A']]);
        $this->answer->is_final_answer = false;
        $this->answer->saved_at = Carbon::now();
        $this->answer->save();
    }

    protected function tearDown(): void
    {
        DB::statement('PRAGMA foreign_keys = ON;');
        parent::tearDown();
    }

    public function test_can_save_answer(): void
    {
        $this->question = AttemptQuestion::first();
        $payload = [
            'attempt_uuid' => $this->attempt->uuid,
            'attempt_question_uuid' => $this->question->uuid,
            'answer_type' => 'MULTIPLE_CHOICE',
            'answer_json' => ['selected' => ['A']],
        ];
        
        $response = $this->actingAs($this->user)->json('POST', '/api/v1/delivery/attempts/' . $this->attempt->uuid . '/answers', $payload);

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data', 'message']);
    }

    public function test_can_update_answer(): void
    {
        $payload = [
            'answer_uuid' => $this->answer->uuid,
            'answer_type' => 'MULTIPLE_CHOICE',
            'answer_json' => ['selected' => ['B']],
        ];
        
        $response = $this->actingAs($this->user)->json('PUT', '/api/v1/delivery/answers/' . $this->answer->uuid, $payload);

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data', 'message']);
    }

    public function test_can_auto_save_answer(): void
    {
        $this->question = AttemptQuestion::first();
        $payload = [
            'attempt_uuid' => $this->attempt->uuid,
            'attempt_question_uuid' => $this->question->uuid,
            'answer_json' => ['selected' => ['C']],
            'answer_version' => 1,
        ];

        $response = $this->actingAs($this->user)->json('POST', '/api/v1/delivery/attempts/' . $this->attempt->uuid . '/answers/auto-save', $payload);

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'message']);
    }

    public function test_can_view_answer(): void
    {
        $response = $this->actingAs($this->user)->json('GET', '/api/v1/delivery/answers/' . $this->answer->uuid);

        $response->assertStatus(200)
                 ->assertJsonPath('data.uuid', $this->answer->uuid);
    }
}
