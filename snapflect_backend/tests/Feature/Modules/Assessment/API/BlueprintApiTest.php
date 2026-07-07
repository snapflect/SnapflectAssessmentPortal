<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Assessment\API;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class BlueprintApiTest extends TestCase
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
        $assessment = Assessment::factory()->create(['organization_id' => $this->user->organization_id]);
        $blueprintUuid = Str::uuid()->toString();
        DB::table('assessment_blueprints')->insert([
            'uuid' => $blueprintUuid,
            'assessment_id' => $assessment->id,
            'organization_id' => $this->user->organization_id,
            'blueprint_name' => 'Test Blueprint',
            'status' => 'DRAFT'
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/v1/assessment/blueprints');
        $response->assertStatus(200);
    }


}
