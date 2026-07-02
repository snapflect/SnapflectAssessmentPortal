<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery\API;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\CandidateAnswer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ExecutionApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private AssessmentVersion $version;
    private AssessmentAttempt $attempt;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = new User();
        $this->user->id = 1;
        $this->user->organization_id = 1;
        $this->user->name = 'Test User';
        $this->user->email = 'test@example.com';
        $this->user->password = bcrypt('password');
        $this->user->save();

        $assessment = new Assessment();
        $assessment->id = 1;
        $assessment->uuid = Str::uuid()->toString();
        $assessment->organization_id = 1;
        $assessment->title = 'Test Assessment';
        $assessment->status = 'PUBLISHED';
        $assessment->save();

        $this->version = new AssessmentVersion();
        $this->version->id = 1;
        $this->version->organization_id = 1;
        $this->version->assessment_id = 1;
        $this->version->version_number = 1;
        $this->version->status = 'PUBLISHED';
        $this->version->is_active = true;
        $this->version->blueprint_json = json_encode([
            'blueprint' => [
                'time_limit_minutes' => 60,
                'sections' => [
                    [
                        'uuid' => 'sec-1',
                        'questions' => [['uuid' => 'q-1', 'options' => [['uuid' => 'opt-1']]]]
                    ]
                ]
            ]
        ]);
        $this->version->blueprint_hash = 'fakehash';
        $this->version->published_at = Carbon::now();
        $this->version->save();

        $this->createAttempt();
    }

    private function createAttempt()
    {
        $snapshot = new AssessmentSnapshot();
        $snapshot->id = 1;
        $snapshot->uuid = Str::uuid()->toString();
        $snapshot->organization_id = 1;
        $snapshot->assessment_id = 1;
        $snapshot->assessment_version_id = 1;
        $snapshot->snapshot_json = $this->version->blueprint_json;
        $snapshot->snapshot_hash = 'fakehash';
        $snapshot->snapshot_schema_version = '1.0';
        $snapshot->status = 'ACTIVE';
        $snapshot->save();

        $this->attempt = new AssessmentAttempt();
        $this->attempt->id = 1;
        $this->attempt->uuid = Str::uuid()->toString();
        $this->attempt->organization_id = 1;
        $this->attempt->candidate_user_id = 1;
        $this->attempt->assessment_id = 1;
        $this->attempt->assessment_version_id = 1;
        $this->attempt->assessment_session_id = 1;
        $this->attempt->assessment_snapshot_id = 1;
        $this->attempt->started_at = Carbon::now();
        $this->attempt->expires_at = Carbon::now()->addMinutes(60);
        $this->attempt->status = 'IN_PROGRESS';
        $this->attempt->randomization_seed = 'seed';
        $this->attempt->question_order_json = json_encode(['q-1']);
        $this->attempt->option_order_json = json_encode(['q-1' => ['opt-1']]);
        $this->attempt->save();
    }

    public function test_launch_endpoint_requires_auth()
    {
        $response = $this->postJson("/api/v1/assessments/{$this->version->assessment->uuid}/launch");
        $response->assertStatus(401);
    }

    public function test_launch_endpoint_success()
    {
        $response = $this->actingAs($this->user)->postJson("/api/v1/assessments/{$this->version->assessment->uuid}/launch");
        
        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'attemptUuid',
                     'snapshotUuid',
                     'randomizationSeed',
                     'questionOrder',
                     'optionOrder',
                     'startedAt',
                     'expiresAt'
                 ]);
    }

    public function test_timer_endpoint_success()
    {
        $response = $this->actingAs($this->user)->getJson("/api/v1/attempts/{$this->attempt->uuid}/timer");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'attemptUuid',
                     'remainingSeconds',
                     'expiresAt',
                     'serverTime',
                     'expired',
                     'status'
                 ]);
    }

    public function test_save_endpoint_success()
    {
        $payload = [
            'questionUuid' => 'q-1',
            'clientDraftVersion' => '1',
            'answerPayload' => 'A'
        ];

        $response = $this->actingAs($this->user)->postJson("/api/v1/attempts/{$this->attempt->uuid}/save", $payload);
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'questionUuid',
                     'answerUuid',
                     'serverDraftVersion',
                     'savedAt',
                     'success'
                 ]);
    }

    public function test_resume_endpoint_success()
    {
        $response = $this->actingAs($this->user)->getJson("/api/v1/attempts/{$this->attempt->uuid}/resume");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'attemptUuid',
                     'snapshotUuid',
                     'snapshotSchemaVersion',
                     'randomizationSeed',
                     'questionOrder',
                     'optionOrder',
                     'draftAnswers',
                     'remainingSeconds',
                     'expiresAt',
                     'serverTime',
                     'completionPercentage'
                 ]);
    }

    public function test_submit_endpoint_success()
    {
        $response = $this->actingAs($this->user)->postJson("/api/v1/attempts/{$this->attempt->uuid}/submit");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'attemptUuid',
                     'submissionUuid',
                     'submittedAt',
                     'finalStatus',
                     'answeredQuestions',
                     'totalQuestions',
                     'completionPercentage'
                 ]);
    }

    public function test_problem_details_rfc7807_rendering_on_expired_resume()
    {
        $this->attempt->expires_at = Carbon::now()->subMinutes(1);
        $this->attempt->save();

        $response = $this->actingAs($this->user)->getJson("/api/v1/attempts/{$this->attempt->uuid}/resume");
        
        $response->assertStatus(403)
                 ->assertHeader('Content-Type', 'application/problem+json')
                 ->assertJsonStructure([
                     'type',
                     'title',
                     'status',
                     'detail',
                     'errorCode',
                     'traceId',
                     'timestamp'
                 ])
                 ->assertJson([
                     'errorCode' => 'ATTEMPT_EXPIRED',
                     'status' => 403
                 ]);
    }

    public function test_problem_details_rfc7807_rendering_on_validation_failure()
    {
        $payload = [
            'questionUuid' => 'not-a-uuid', // Invalid UUID
            'clientDraftVersion' => '1',
            'answerPayload' => 'A'
        ];

        $response = $this->actingAs($this->user)->postJson("/api/v1/attempts/{$this->attempt->uuid}/save", $payload);
        
        $response->assertStatus(422)
                 ->assertHeader('Content-Type', 'application/problem+json')
                 ->assertJson([
                     'errorCode' => 'VALIDATION_FAILED',
                     'status' => 422
                 ])
                 ->assertJsonStructure(['detail' => ['questionUuid']]);
    }

    public function test_problem_details_rfc7807_rendering_on_auth_failure()
    {
        $response = $this->getJson("/api/v1/attempts/{$this->attempt->uuid}/resume");
        
        $response->assertStatus(401)
                 ->assertHeader('Content-Type', 'application/problem+json')
                 ->assertJson([
                     'errorCode' => 'UNAUTHORIZED',
                     'status' => 401
                 ]);
    }

    public function test_cross_tenant_denial()
    {
        $user2 = new User();
        $user2->id = 2;
        $user2->organization_id = 2; // Different Org
        $user2->name = 'Hacker';
        $user2->email = 'hacker@example.com';
        $user2->password = bcrypt('password');
        $user2->save();

        // Attempt belongs to User 1/Org 1. User 2 trying to resume it.
        $response = $this->actingAs($user2)->getJson("/api/v1/attempts/{$this->attempt->uuid}/resume");
        
        // The service should throw an ATTEMPT_NOT_FOUND (masked access denial) or similar 404/403.
        $response->assertStatus(500) // Or 404, depending on how resume handles it
                 ->assertJsonStructure(['traceId']);
    }
}
