<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Policies;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class PublicationPolicyTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_organization_admin_can_publish()
    {
        $orgAdmin = \App\Modules\Security\Models\User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']));

        $policy = new \App\Modules\Assessment\Policies\AssessmentPublicationPolicy();

        $this->assertTrue($policy->create($orgAdmin));
    }

    public function test_department_manager_cannot_publish()
    {
        $deptManager = \App\Modules\Security\Models\User::factory()->create();
        $deptManager->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'DEPT_MANAGER', 'role_name' => 'DEPT_MANAGER']));

        $policy = new \App\Modules\Assessment\Policies\AssessmentPublicationPolicy();

        $this->assertFalse($policy->create($deptManager));
    }
}

