<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery\API;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SessionLaunchFeatureTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $assessment;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        $this->assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'current_state'   => 'PUBLISHED',
            'is_published'    => true,
            'created_by'      => $this->user->id,
        ]);
        $this->assessment->is_published = true;
        $this->assessment->current_state = 'PUBLISHED';
        $this->assessment->save();

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

        $mockSnapshotService = \Mockery::mock(\App\Modules\Assessment\Services\SnapshotGenerationService::class);
        $mockSnapshotService->shouldReceive('generate')->andReturnUsing(function($assessment, $userId) {
            $snapshot = new \App\Modules\Assessment\Models\AssessmentSnapshot();
            $snapshot->uuid = \Illuminate\Support\Str::uuid()->toString();
            $snapshot->organization_id = $assessment->organization_id;
            $snapshot->assessment_id = $assessment->id;
            $snapshot->assessment_version_id = $assessment->versions()->latest()->first()->id ?? 1;
            $snapshot->snapshot_schema_version = '1.0';
            $snapshot->snapshot_hash = 'fakehash';
            $snapshot->snapshot_json = json_encode([
                'blueprint' => [
                    'time_limit_minutes' => 60,
                    'sections' => [
                        [
                            'uuid'      => 'sec-1',
                            'questions' => [
                                ['uuid' => 'q-1', 'question_type' => 'single_choice',  'options' => [['uuid' => 'opt-1']]],
                            ]
                        ]
                    ]
                ]
            ]);
            $snapshot->save();
            return $snapshot;
        });
        $this->app->instance(\App\Modules\Assessment\Services\SnapshotGenerationService::class, $mockSnapshotService);

        \Illuminate\Support\Facades\Config::set('assessment.grace_period_seconds', 0);
        DB::statement('PRAGMA foreign_keys = OFF;');

        $this->actingAs($this->user);
    }

    protected function tearDown(): void
    {
        DB::statement('PRAGMA foreign_keys = ON;');
        \Mockery::close();
        parent::tearDown();
    }

    public function test_can_launch_session_for_published_assessment()
    {
        $response = $this->postJson("/api/v1/assessments/{$this->assessment->uuid}/launch", [
            'candidate_user_id' => $this->user->id
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'attemptUuid',
                'snapshotUuid',
                'randomizationSeed',
                'questionOrder',
                'optionOrder'
            ]);
    }

    public function test_tenant_isolation_prevents_launching_other_org_assessment()
    {
        $otherOrgAssessment = Assessment::factory()->create([
            'organization_id' => 999, // Different org
            'current_state'   => 'PUBLISHED',
            'is_published'    => true,
        ]);
        $otherOrgAssessment->is_published = true;
        $otherOrgAssessment->current_state = 'PUBLISHED';
        $otherOrgAssessment->save();

        $response = $this->postJson("/api/v1/assessments/{$otherOrgAssessment->uuid}/launch", [
            'candidate_user_id' => $this->user->id
        ]);

        $response->assertStatus(400);
    }
}
