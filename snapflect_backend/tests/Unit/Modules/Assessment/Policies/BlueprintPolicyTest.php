<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Policies;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class BlueprintPolicyTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_editable_when_draft()
    {
        $orgAdmin = \App\Modules\Security\Models\User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']));

        $assessment = new \App\Modules\Assessment\Models\Assessment();
        $assessment->organization_id = $orgAdmin->organization_id;
        $assessment->current_state = 'DRAFT';
        $assessment->id = 1;

        $blueprint = new \App\Modules\Assessment\Models\AssessmentBlueprint();
        $blueprint->assessment_id = $assessment->id;
        $blueprint->organization_id = $assessment->organization_id;
        $blueprint->setRelation('assessment', $assessment);

        $policy = new \App\Modules\Assessment\Policies\AssessmentBlueprintPolicy();

        $this->assertTrue($policy->update($orgAdmin, $blueprint));
    }

    public function test_uneditable_when_published()
    {
        $orgAdmin = \App\Modules\Security\Models\User::factory()->create();
        $orgAdmin->roles()->attach(\App\Modules\Security\Models\Role::factory()->create(['role_code' => 'ORG_ADMIN', 'role_name' => 'ORG_ADMIN']));

        $assessment = new \App\Modules\Assessment\Models\Assessment();
        $assessment->organization_id = $orgAdmin->organization_id;
        $assessment->current_state = 'PUBLISHED';
        $assessment->id = 1;

        $blueprint = new \App\Modules\Assessment\Models\AssessmentBlueprint();
        $blueprint->assessment_id = $assessment->id;
        $blueprint->organization_id = $assessment->organization_id;
        $blueprint->setRelation('assessment', $assessment);

        $policy = new \App\Modules\Assessment\Policies\AssessmentBlueprintPolicy();

        $this->assertFalse($policy->update($orgAdmin, $blueprint));
    }
}

