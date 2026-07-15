<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery\API;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\AssessmentSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ExecutionApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;
    private AssessmentVersion $version;
    private AssessmentAttempt $attempt;
    private AssessmentSnapshot $snapshot;
    private string $qUuid;

    protected function setUp(): void
    {
        parent::setUp();
        
        $subscriptionMock = \Mockery::mock(\App\Modules\Billing\Services\SubscriptionService::class);
        $subscriptionMock->shouldReceive('checkAccess')->andReturn(true);
        $this->app->instance(\App\Modules\Billing\Services\SubscriptionService::class, $subscriptionMock);
        
        $this->user = User::factory()->create();
        $this->qUuid = Str::uuid()->toString();

        \Illuminate\Support\Facades\DB::table('question_banks')->insert([
            'id' => 1,
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'bank_name' => 'Default Bank',
            'bank_code' => 'DEFAULT_BANK',
            'status' => 'ACTIVE',
            'created_date' => Carbon::now(),
            'modified_date' => Carbon::now()
        ]);

        $this->assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'assessment_name' => 'Test Assessment',
            'current_state'   => 'PUBLISHED',
            'is_published'    => true,
            'created_by'      => $this->user->id,
        ]);

        $this->version = new AssessmentVersion();
        $this->version->organization_id = $this->user->organization_id;
        $this->version->assessment_id   = $this->assessment->id;
        $this->version->major_version   = 1;
        $this->version->minor_version   = 0;
        $this->version->version_label   = '1.0';
        $this->version->status          = 'PUBLISHED';
        $this->version->change_summary  = 'Initial version';
        $this->version->published_date  = Carbon::now();
        $this->version->created_by      = $this->user->id;
        $this->version->save();

        $this->createAttempt();
    }

    private function createAttempt()
    {
        $optUuid = Str::uuid()->toString();

        $this->snapshot = new AssessmentSnapshot();
        $this->snapshot->uuid = Str::uuid()->toString();
        $this->snapshot->organization_id = $this->assessment->organization_id;
        $this->snapshot->assessment_id = $this->assessment->id;
        $this->snapshot->assessment_version_id = $this->version->id;
        $this->snapshot->snapshot_json = json_encode([
            'blueprint' => [
                'time_limit_minutes' => 60,
                'sections' => [
                    [
                        'uuid' => Str::uuid()->toString(),
                        'questions' => [['uuid' => $this->qUuid, 'options' => [['uuid' => $optUuid]]]]
                    ]
                ]
            ]
        ]);
        $this->snapshot->snapshot_hash = 'fakehash';
        $this->snapshot->snapshot_schema_version = '1.0';
        $this->snapshot->save();
        
        $session = new AssessmentSession();
        $session->uuid = Str::uuid()->toString();
        $session->organization_id = $this->user->organization_id;
        $session->assessment_id = $this->assessment->id;
        $session->assessment_version_id = $this->version->id;
        $session->assessment_snapshot_id = $this->snapshot->id;
        $session->candidate_user_id = $this->user->id;
        $session->created_by = $this->user->id;
        $session->session_status = 'LAUNCHED';
        $session->session_token = Str::random(32);
        $session->save();

        $this->attempt = new AssessmentAttempt();
        $this->attempt->uuid = Str::uuid()->toString();
        $this->attempt->organization_id = $this->user->organization_id;
        $this->attempt->candidate_user_id = $this->user->id;
        $this->attempt->assessment_id = $this->assessment->id;
        $this->attempt->assessment_version_id = $this->version->id;
        $this->attempt->assessment_session_id = $session->id;
        $this->attempt->assessment_snapshot_id = $this->snapshot->id;
        $this->attempt->started_at = Carbon::now();
        $this->attempt->expires_at = Carbon::now()->addMinutes(60);
        $this->attempt->status = 'CREATED';
        $this->attempt->randomization_seed = 'seed';
        $this->attempt->question_order_json = json_encode([
            [
                'uuid' => 'sec-1',
                'questions' => [$this->qUuid]
            ]
        ]);
        $this->attempt->option_order_json = json_encode([$this->qUuid => [$optUuid]]);
        $this->attempt->save();

        \Illuminate\Support\Facades\DB::table('questions')->insert([
            'id' => 999,
            'uuid' => $this->qUuid,
            'organization_id' => $this->user->organization_id,
            'question_bank_id' => 1,
            'question_text' => 'Test',
            'question_code' => 'Q_999',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'EASY',
            'status' => 'ACTIVE',
            'created_date' => Carbon::now(),
            'modified_date' => Carbon::now()
        ]);

        $sUuid = Str::uuid()->toString();

        \Illuminate\Support\Facades\DB::table('assessment_blueprints')->insert([
            'id' => 1,
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'assessment_id' => $this->assessment->id,
            'blueprint_name' => 'Default Blueprint',
            'created_date' => Carbon::now(),
            'modified_date' => Carbon::now()
        ]);

        \Illuminate\Support\Facades\DB::table('blueprint_sections')->insert([
            'id' => 1,
            'uuid' => $sUuid,
            'blueprint_id' => 1,
            'section_name' => 'Default Section',
            'display_order' => 1,
            'selection_strategy' => 'RANDOM',
            'created_date' => Carbon::now(),
            'modified_date' => Carbon::now()
        ]);

        \Illuminate\Support\Facades\DB::table('attempt_sections')->insert([
            'id' => 1,
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'snapshot_section_uuid' => $sUuid,
            'section_name' => 'Default Section',
            'display_order' => 1,
            'created_date' => Carbon::now()
        ]);

        \Illuminate\Support\Facades\DB::table('attempt_questions')->insert([
            'id' => 999,
            'uuid' => Str::uuid()->toString(),
            'organization_id' => $this->user->organization_id,
            'assessment_attempt_id' => $this->attempt->id,
            'attempt_section_id' => 1,
            'snapshot_question_uuid' => $this->qUuid,
            'question_code' => 'Q_999',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'EASY',
            'display_order' => 1,
            'created_date' => Carbon::now()
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
            'questionUuid' => $this->qUuid,
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
                 ]);
    }

    public function test_problem_details_rfc7807_rendering_on_validation_failure()
    {
        $payload = [
            'questionUuid' => 'not-a-uuid',
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
                 ->assertHeader('Content-Type', 'application/problem+json');
    }

    public function test_cross_tenant_denial()
    {
        $user2 = User::factory()->create();
        $user2->organization_id = 999;
        $user2->save();

        $response = $this->actingAs($user2)->getJson("/api/v1/attempts/{$this->attempt->uuid}/resume");
        
        $response->assertStatus(404);
    }
}
