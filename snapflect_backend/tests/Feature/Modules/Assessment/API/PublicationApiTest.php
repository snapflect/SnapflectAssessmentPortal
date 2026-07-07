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

class PublicationApiTest extends TestCase
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
        $response = $this->actingAs($this->user)->getJson('/api/v1/assessment/publications');
        $response->assertStatus(200);
    }

    public function test_returns_201_created()
    {
        $assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'current_state' => 'APPROVED'
        ]);

        $blueprintId = DB::table('assessment_blueprints')->insertGetId([
            'uuid' => Str::uuid(),
            'assessment_id' => $assessment->id,
            'organization_id' => $this->user->organization_id,
            'blueprint_name' => 'Blueprint',
            'status' => 'ACTIVE'
        ]);
        $sectionId = DB::table('blueprint_sections')->insertGetId([
            'uuid' => Str::uuid(),
            'blueprint_id' => $blueprintId,
            'section_name' => 'Section 1',
            'display_order' => 1,
            'selection_strategy' => 'MANUAL',
            'section_weight' => 100
        ]);
        $qbId = DB::table('question_banks')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $this->user->organization_id,
            'bank_code' => 'QB-' . Str::random(5),
            'bank_name' => 'Bank',
        ]);
        $qId = DB::table('questions')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $this->user->organization_id,
            'question_bank_id' => $qbId,
            'question_code' => 'Q-' . Str::random(5),
            'question_text' => 'Question?',
            'question_type' => 'MULTIPLE_CHOICE',
            'difficulty_level' => 'EASY',
            'max_score' => 1
        ]);
        DB::table('blueprint_section_questions')->insert([
            'uuid' => Str::uuid(),
            'blueprint_section_id' => $sectionId,
            'question_id' => $qId,
            'display_order' => 1
        ]);
        DB::table('question_options')->insert([
            'uuid' => Str::uuid(),
            'question_id' => $qId,
            'option_text' => 'Option 1',
            'is_correct' => 1,
            'display_order' => 1
        ]);
        $cgId = DB::table('competency_groups')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $this->user->organization_id,
            'group_code' => 'CG-' . Str::random(5),
            'group_name' => 'CG 1'
        ]);
        $compId = DB::table('competencies')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $this->user->organization_id,
            'competency_group_id' => $cgId,
            'competency_code' => 'COMP-' . Str::random(5),
            'competency_name' => 'Comp 1'
        ]);
        DB::table('question_competencies')->insert([
            'uuid' => Str::uuid(),
            'question_id' => $qId,
            'competency_id' => $compId,
            'weight_percentage' => 100
        ]);

        $payload = [
            'assessment_uuid' => $assessment->uuid,
            'publication_code' => 'PUB-' . Str::random(5),
            'title' => 'Test Publication',
            'start_date' => now()->addDay()->toIso8601String(),
            'end_date' => now()->addDays(7)->toIso8601String(),
            'max_attempts' => 1,
            'is_proctored' => false,
        ];
        
        $response = $this->actingAs($this->user)->postJson('/api/v1/assessment/publications', $payload);
        $response->assertStatus(201);
    }
}
