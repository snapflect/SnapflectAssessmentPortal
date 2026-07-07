<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Assessment\API;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Assessment\Models\Assessment;

class AssessmentApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $role1 = Role::factory()->create(['role_code' => 'CLIENT_ADMIN', 'role_name' => 'CLIENT_ADMIN']);
        $role2 = Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']);
        $this->user->roles()->attach([$role1->id, $role2->id]);
    }

    public function test_returns_200_ok()
    {
        Assessment::factory()->count(3)->create(['organization_id' => $this->user->organization_id]);
        $response = $this->actingAs($this->user)->getJson('/api/v1/assessment/assessments');
        $response->assertStatus(200);
    }

    public function test_returns_201_created()
    {
        $category = \App\Modules\Assessment\Models\AssessmentCategory::factory()->create(['organization_id' => $this->user->organization_id]);
        $type = \App\Modules\Assessment\Models\AssessmentType::factory()->create(['organization_id' => $this->user->organization_id]);
        
        $payload = [
            'assessment_code' => 'A123',
            'assessment_name' => 'Test Assessment',
            'assessment_category_uuid' => $category->uuid,
            'assessment_type_uuid' => $type->uuid,
            'is_randomized' => false,
        ];
        $response = $this->actingAs($this->user)->postJson('/api/v1/assessment/assessments', $payload);
        $response->assertStatus(201);
    }

    public function test_returns_401_unauthorized()
    {
        $response = $this->getJson('/api/v1/assessment/assessments');
        $this->assertTrue(in_array($response->status(), [401, 403]));
    }

    public function test_returns_403_forbidden()
    {
        $this->mock(\App\Modules\Billing\Services\SubscriptionService::class, function ($mock) {
            $mock->shouldReceive('checkAccess')->andReturn(true);
            $mock->shouldReceive('hasActiveSubscription')->andReturn(true);
        });
        
        $user = User::factory()->create();
        $assessment = Assessment::factory()->create(['organization_id' => 9999]);
        $response = $this->actingAs($user)->getJson('/api/v1/assessment/assessments/' . $assessment->uuid);
        $response->assertStatus(403);
    }

    public function test_returns_404_not_found()
    {
        $response = $this->actingAs($this->user)->getJson('/api/v1/assessment/assessments/999999');
        $response->assertStatus(404);
    }

    public function test_returns_422_validation_error()
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/assessment/assessments', []);
        $response->assertStatus(422);
    }
}
