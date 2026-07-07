<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Delivery\Repositories\Eloquent\AssessmentAttemptRepository;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Security\Models\User;
use Illuminate\Support\Carbon;

class AssessmentAttemptRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected AssessmentAttemptRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new AssessmentAttemptRepository();
    }

    protected function createAttempt(array $overrides = []): AssessmentAttempt
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
            'session_status' => 'IN_PROGRESS',
        ]);

        $data = array_merge([
            'organization_id' => $assessment->organization_id,
            'assessment_session_id' => $session->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => $version->id,
            'assessment_snapshot_id' => $snapshot->id,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'attempt_number' => 1,
        ], $overrides);

        return $this->repository->create($data);
    }

    public function test_find_by_uuid(): void
    {
        $attempt = $this->createAttempt();
        
        $found = $this->repository->findByUuid($attempt->uuid);
        $this->assertNotNull($found);
        $this->assertEquals($attempt->id, $found->id);
    }

    public function test_find_active_attempt(): void
    {
        $attempt = $this->createAttempt(['status' => 'IN_PROGRESS']);
        
        $found = $this->repository->findActiveAttempt(
            $attempt->organization_id, 
            $attempt->candidate_user_id, 
            $attempt->assessment_version_id
        );
        $this->assertNotNull($found);
        $this->assertEquals($attempt->id, $found->id);
    }

    public function test_find_submitted_attempt(): void
    {
        $attempt = $this->createAttempt(['status' => 'SUBMITTED']);
        
        $found = $this->repository->findSubmittedAttempt(
            $attempt->organization_id, 
            $attempt->candidate_user_id, 
            $attempt->assessment_version_id
        );
        $this->assertNotNull($found);
        $this->assertEquals($attempt->id, $found->id);
    }

    public function test_find_expired_attempts(): void
    {
        $this->createAttempt([
            'status' => 'IN_PROGRESS',
            'expires_at' => Carbon::now()->subDay()
        ]);
        
        $this->createAttempt([
            'status' => 'IN_PROGRESS',
            'expires_at' => Carbon::now()->addDay()
        ]);

        $expired = $this->repository->findExpiredAttempts();
        $this->assertCount(1, $expired);
    }
}
