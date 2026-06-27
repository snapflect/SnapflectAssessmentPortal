<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery\API;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Delivery\Models\AssessmentSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class SessionLaunchFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'organization_id' => 1,
        ]);

        $this->assessment = Assessment::create([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => 1,
            'assessment_code' => 'PUB-001',
            'assessment_name' => 'Published Assessment',
            'estimated_duration_minutes' => 60,
            'is_published' => true,
            'status' => 'active',
            'current_state' => 'PUBLISHED',
            'created_by' => $this->user->id
        ]);
        
        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_can_create_session_for_published_assessment()
    {
        $response = $this->postJson("/api/v1/sessions", [
            'assessment_uuid' => $this->assessment->uuid,
            'candidate_user_id' => $this->user->id
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'session_uuid'
                ],
                'message'
            ]);

        $sessionUuid = $response->json('data.session_uuid');
        
        $this->assertDatabaseHas('assessment_sessions', [
            'uuid' => $sessionUuid,
            'session_status' => 'DRAFT',
            'assessment_snapshot_id' => null
        ]);
    }

    public function test_launch_session_generates_snapshot_and_attempt()
    {
        // 1. Create Session
        $session = AssessmentSession::create([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => 1,
            'assessment_id' => $this->assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => null,
            'candidate_user_id' => $this->user->id,
            'session_token' => Str::random(32),
            'session_status' => 'DRAFT',
            'created_by' => $this->user->id
        ]);

        // 2. Launch Session
        $response = $this->postJson("/api/v1/sessions/{$session->uuid}/launch");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'session_uuid',
                    'attempt_uuid',
                    'snapshot_uuid',
                    'launched_at',
                    'launched_by_uuid'
                ],
                'message'
            ]);

        $snapshotUuid = $response->json('data.snapshot_uuid');
        $attemptUuid = $response->json('data.attempt_uuid');

        // Verify Snapshot Created
        $this->assertDatabaseHas('assessment_snapshots', [
            'uuid' => $snapshotUuid,
            'assessment_id' => $this->assessment->id
        ]);

        // Verify Session Updated
        $this->assertDatabaseHas('assessment_sessions', [
            'uuid' => $session->uuid,
            'session_status' => 'LAUNCHED'
        ]);

        // Verify Attempt Created
        $this->assertDatabaseHas('assessment_attempts', [
            'uuid' => $attemptUuid,
            'status' => 'CREATED',
            'assessment_session_id' => $session->id
        ]);
        
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $attemptUuid)->first();
        $this->assertNotNull($attempt->randomization_seed);
        $this->assertNotNull($attempt->question_order_json);
        $this->assertNotNull($attempt->option_order_json);

        // Verify Snapshot schema version
        $snapshot = \App\Modules\Assessment\Models\AssessmentSnapshot::where('uuid', $snapshotUuid)->first();
        $this->assertEquals('1.0', $snapshot->snapshot_schema_version);
    }

    public function test_tenant_isolation_prevents_launching_other_org_session()
    {
        $session = AssessmentSession::create([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => 2, // Different Org
            'assessment_id' => $this->assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => null,
            'candidate_user_id' => $this->user->id,
            'session_token' => Str::random(32),
            'session_status' => 'DRAFT',
            'created_by' => $this->user->id
        ]);

        $response = $this->postJson("/api/v1/sessions/{$session->uuid}/launch");

        $response->assertStatus(500); // Because it throws SessionLaunchException
    }
}
