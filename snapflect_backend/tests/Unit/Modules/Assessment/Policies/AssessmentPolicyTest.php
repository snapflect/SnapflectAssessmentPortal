<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Policies;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;

class AssessmentPolicyTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_platform_admin_override()
    {
        $platformAdmin = User::factory()->create();
        $platformAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'PLATFORM_ADMIN', 'role_name' => 'PLATFORM_ADMIN']));

        $assessment = Assessment::factory()->create();

        $policy = new \App\Modules\Assessment\Policies\AssessmentPolicy();

        $this->assertTrue($policy->before($platformAdmin, 'view'));
    }

    public function test_organization_admin_access()
    {
        $orgAdmin = User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'CLIENT_ADMIN', 'role_name' => 'CLIENT_ADMIN']));

        $assessment = Assessment::factory()->create(['organization_id' => $orgAdmin->organization_id, 'current_state' => 'DRAFT']);

        $policy = new \App\Modules\Assessment\Policies\AssessmentPolicy();

        $this->assertTrue($policy->view($orgAdmin, $assessment));
        $this->assertTrue($policy->update($orgAdmin, $assessment));
        $this->assertTrue($policy->delete($orgAdmin, $assessment));
        $this->assertTrue($policy->submitReview($orgAdmin, $assessment));
    }

    public function test_department_manager_restrictions()
    {
        // Actually, the policy only lists CLIENT_ADMIN, ASSESSMENT_MANAGER, CONTENT_CREATOR, REVIEWER.
        // Let's test a generic user / candidate who should be denied.
        $user = User::factory()->create();
        $user->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'CANDIDATE', 'role_name' => 'CANDIDATE']));

        $assessment = Assessment::factory()->create(['organization_id' => $user->organization_id]);

        $policy = new \App\Modules\Assessment\Policies\AssessmentPolicy();

        $this->assertFalse($policy->view($user, $assessment));
        $this->assertFalse($policy->create($user));
    }

    public function test_candidate_restrictions()
    {
        $candidate = User::factory()->create();
        $candidate->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'CANDIDATE', 'role_name' => 'CANDIDATE']));

        $assessment = Assessment::factory()->create(['organization_id' => $candidate->organization_id]);
        $policy = new \App\Modules\Assessment\Policies\AssessmentPolicy();

        $this->assertFalse($policy->view($candidate, $assessment));
        $this->assertFalse($policy->update($candidate, $assessment));
        $this->assertFalse($policy->delete($candidate, $assessment));
    }

    public function test_cross_tenant_denial()
    {
        $orgAdmin = User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'CLIENT_ADMIN', 'role_name' => 'CLIENT_ADMIN']));

        $assessment = Assessment::factory()->create(); // different organization_id by default

        $policy = new \App\Modules\Assessment\Policies\AssessmentPolicy();

        $this->assertFalse($policy->view($orgAdmin, $assessment));
        $this->assertFalse($policy->update($orgAdmin, $assessment));
        $this->assertFalse($policy->delete($orgAdmin, $assessment));
    }
}


