<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Policies;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class QuestionPolicyTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_platform_admin_override()
    {
        $platformAdmin = \App\Modules\Security\Models\User::factory()->create();
        $platformAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'PLATFORM_ADMIN', 'role_name' => 'PLATFORM_ADMIN']));

        $question = new \App\Modules\Assessment\Models\Question();
        $policy = new \App\Modules\Assessment\Policies\QuestionPolicy();

        $this->assertTrue($policy->before($platformAdmin, 'view'));
    }

    public function test_organization_admin_access()
    {
        $orgAdmin = \App\Modules\Security\Models\User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']));

        $question = new \App\Modules\Assessment\Models\Question();
        $question->organization_id = $orgAdmin->organization_id;
        $policy = new \App\Modules\Assessment\Policies\QuestionPolicy();

        $this->assertTrue($policy->view($orgAdmin, $question));
        $this->assertTrue($policy->update($orgAdmin, $question));
        $this->assertTrue($policy->delete($orgAdmin, $question));
    }

    public function test_cross_tenant_denial()
    {
        $orgAdmin = \App\Modules\Security\Models\User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']));

        $question = new \App\Modules\Assessment\Models\Question();
        $question->organization_id = 999; // different org
        $policy = new \App\Modules\Assessment\Policies\QuestionPolicy();

        $this->assertFalse($policy->view($orgAdmin, $question));
        $this->assertFalse($policy->update($orgAdmin, $question));
        $this->assertFalse($policy->delete($orgAdmin, $question));
    }

    public function test_system_question_bank_visible()
    {
        // For now, there's no system_question_bank logic in the policy,
        // but we can test that viewAny passes for ORG_ADMIN.
        $orgAdmin = \App\Modules\Security\Models\User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']));
        
        $policy = new \App\Modules\Assessment\Policies\QuestionPolicy();
        $this->assertTrue($policy->viewAny($orgAdmin));
    }
}

