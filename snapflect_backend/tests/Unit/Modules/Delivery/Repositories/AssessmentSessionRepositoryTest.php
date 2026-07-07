<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Delivery\Repositories\Eloquent\AssessmentSessionRepository;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Support\Carbon;

class AssessmentSessionRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected AssessmentSessionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new AssessmentSessionRepository();
    }

    protected function createSession(array $overrides = []): AssessmentSession
    {
        $assessment = Assessment::factory()->create();
        $version = AssessmentVersion::create([
            'assessment_id' => $assessment->id,
            'major_version' => 1,
            'minor_version' => 0,
            'version_label' => '1.0',
            'organization_id' => $assessment->organization_id,
        ]);

        $data = array_merge([
            'organization_id' => $assessment->organization_id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => $version->id,
            'candidate_user_id' => 1,
            'session_token' => $this->faker->uuid,
            'session_status' => 'ACTIVE',
        ], $overrides);

        return $this->repository->create($data);
    }

    public function test_find_by_uuid(): void
    {
        $session = $this->createSession();
        
        $found = $this->repository->findByUuid($session->uuid);
        $this->assertNotNull($found);
        $this->assertEquals($session->id, $found->id);
    }

    public function test_find_active_session_by_candidate(): void
    {
        $session = $this->createSession(['session_status' => 'ACTIVE']);
        
        $found = $this->repository->findActiveSessionByCandidate(
            $session->organization_id, 
            $session->candidate_user_id
        );
        $this->assertNotNull($found);
        $this->assertEquals($session->id, $found->id);
    }

    public function test_find_expired_sessions(): void
    {
        $this->createSession([
            'session_status' => 'ACTIVE',
            'access_expires_at' => Carbon::now()->subDay()
        ]);
        
        $this->createSession([
            'session_status' => 'ACTIVE',
            'access_expires_at' => Carbon::now()->addDay()
        ]);

        $expired = $this->repository->findExpiredSessions();
        $this->assertCount(1, $expired);
    }
}
