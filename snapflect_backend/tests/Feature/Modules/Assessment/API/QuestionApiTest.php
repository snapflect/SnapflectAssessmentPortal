<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Assessment\API;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class QuestionApiTest extends TestCase
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
        $response = $this->actingAs($this->user)->getJson('/api/v1/assessment/questions');
        $response->assertStatus(200);
    }

    public function test_returns_403_forbidden_cross_tenant()
    {
        $questionUuid = Str::uuid()->toString();
        $qbId = DB::table('question_banks')->insertGetId([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => 9999,
            'bank_code' => 'QB' . rand(1, 1000),
            'bank_name' => 'Bank',
        ]);
        DB::table('questions')->insert([
            'uuid' => $questionUuid,
            'organization_id' => 9999, // Different org
            'question_bank_id' => $qbId,
            'question_code' => 'Q' . rand(1, 1000),
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'EASY',
            'question_text' => 'Cross tenant question',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/v1/assessment/questions/' . $questionUuid);
        $response->assertStatus(403);
    }
}
