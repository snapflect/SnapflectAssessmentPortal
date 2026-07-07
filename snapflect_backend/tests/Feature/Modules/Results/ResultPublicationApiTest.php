<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Services\PublicationService;
use Mockery;

class ResultPublicationApiTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'ORGANIZATION_ADMIN']);
        $user->roles()->attach($role);
        return $user;
    }

    public function test_publish_result(): void
    {
        $user = $this->createAdminUser();
        $this->actingAs($user);

        $result = AssessmentResult::create([
            'organization_id' => $user->organization_id ?? 1,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => $user->id,
            'result_reference' => 'REF-123',
            'result_version' => 1,
            'status' => 'COMPLETED',
            'overall_score' => 80.5,
        ]);

        $mockService = Mockery::mock(PublicationService::class);
        $mockService->shouldReceive('publish')->once()->andReturnNull();
        $this->app->instance(PublicationService::class, $mockService);

        $response = $this->postJson("/api/v1/results/{$result->uuid}/publish", [
            'result_uuid' => $result->uuid,
            'publication_notes' => 'Published successfully'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    public function test_archive_result(): void
    {
        $user = $this->createAdminUser();
        $this->actingAs($user);

        $result = AssessmentResult::create([
            'organization_id' => $user->organization_id ?? 1,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => $user->id,
            'result_reference' => 'REF-123',
            'result_version' => 1,
            'status' => 'COMPLETED',
            'overall_score' => 80.5,
        ]);

        $mockService = Mockery::mock(PublicationService::class);
        $mockService->shouldReceive('archive')->once()->andReturnNull();
        $this->app->instance(PublicationService::class, $mockService);

        $response = $this->postJson("/api/v1/results/{$result->uuid}/archive", [
            'result_uuid' => $result->uuid,
            'archive_reason' => 'Archived successfully'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }
}
