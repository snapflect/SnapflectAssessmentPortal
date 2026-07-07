<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Delivery\Models\AssessmentSession;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SessionFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;

    protected function setUp(): void
    {
        parent::setUp();
        
        DB::statement('PRAGMA foreign_keys = OFF;');
        $this->user = User::factory()->create();
        
        // Mock Snapshot Service
        $mockSnapshotService = \Mockery::mock(\App\Modules\Assessment\Services\SnapshotGenerationService::class);
        $mockSnapshotService->shouldReceive('generate')->andReturnUsing(function($assessment, $userId) {
            $snapshot = new \App\Modules\Assessment\Models\AssessmentSnapshot();
            $snapshot->uuid = Str::uuid()->toString();
            $snapshot->organization_id = $assessment->organization_id;
            $snapshot->assessment_id = $assessment->id;
            $snapshot->assessment_version_id = $assessment->versions()->latest()->first()->id ?? 1;
            $snapshot->snapshot_schema_version = '1.0';
            $snapshot->snapshot_hash = 'fakehash';
            $snapshot->snapshot_json = json_encode(['blueprint' => ['time_limit_minutes' => 60, 'sections' => []]]);
            $snapshot->save();
            return $snapshot;
        });
        $this->app->instance(\App\Modules\Assessment\Services\SnapshotGenerationService::class, $mockSnapshotService);

        $this->assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'current_state'   => 'PUBLISHED',
            'is_published'    => true,
            'created_by'      => $this->user->id,
        ]);

        $version = new AssessmentVersion();
        $version->organization_id = $this->user->organization_id;
        $version->assessment_id   = $this->assessment->id;
        $version->major_version   = 1;
        $version->minor_version   = 0;
        $version->version_label   = '1.0';
        $version->status          = 'PUBLISHED';
        $version->change_summary  = 'Initial version';
        $version->published_date  = Carbon::now();
        $version->created_by      = $this->user->id;
        $version->save();
    }

    protected function tearDown(): void
    {
        DB::statement('PRAGMA foreign_keys = ON;');
        \Mockery::close();
        parent::tearDown();
    }

    private function createSession(): AssessmentSession
    {
        $session = new AssessmentSession();
        $session->uuid = Str::uuid()->toString();
        $session->organization_id = $this->user->organization_id;
        $session->assessment_id = $this->assessment->id;
        $session->assessment_version_id = 1;
        $session->candidate_user_id = $this->user->id;
        $session->session_status = 'DRAFT';
        $session->session_token = Str::random(32);
        $session->created_by = $this->user->id;
        $session->save();
        
        return $session;
    }

    public function test_can_list_sessions(): void
    {
        $this->createSession();
        $this->createSession();

        $response = $this->actingAs($this->user)->json('GET', '/api/v1/delivery/sessions');

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data' => [['uuid']]]);
    }

    public function test_can_create_session(): void
    {
        $payload = [
            'assessment_uuid' => $this->assessment->uuid,
            'candidate_user_id' => $this->user->id
        ];

        $response = $this->actingAs($this->user)->json('POST', '/api/v1/delivery/sessions', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure(['success', 'data' => ['session_uuid'], 'message']);
    }

    public function test_can_launch_session(): void
    {
        $session = $this->createSession();

        $response = $this->actingAs($this->user)->json('POST', '/api/v1/delivery/sessions/' . $session->uuid . '/launch');

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data' => ['attempt_uuid'], 'message']);
    }

    public function test_can_show_session(): void
    {
        $session = $this->createSession();

        $response = $this->actingAs($this->user)->json('GET', '/api/v1/delivery/sessions/' . $session->uuid);

        $response->assertStatus(200)
                 ->assertJsonPath('data.session_uuid', $session->uuid);
    }
}
