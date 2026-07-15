<?php

declare(strict_types=1);

namespace Tests\Feature\Security;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Models\BusinessUnit;
use App\Modules\Assessment\Models\QuestionBank;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StructuralAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_deny_by_default_prevents_unauthorized_access(): void
    {
        $org = Organization::forceCreate(['organization_name' => 'Org', 'organization_code' => 'ORG1', 'contact_email' => 'test@test.com', 'status' => 'ACTIVE']);
        $bu = BusinessUnit::forceCreate(['organization_id' => $org->id, 'business_unit_name' => 'BU1', 'business_unit_code' => 'BU1', 'status' => 'ACTIVE']);
        
        // 1. User with a role that is NOT part of structural ABAC branches
        $user = User::factory()->create([
            'organization_id' => $org->id,
            'department_id' => null
        ]);
        
        $role = Role::forceCreate(['role_code' => 'REVIEWER', 'role_name' => 'Reviewer']);
        $user->roles()->attach($role);
        
        $bank = QuestionBank::forceCreate([
            'organization_id' => $org->id,
            'department_id' => null,
            'business_unit_id' => $bu->id,
            'bank_name' => 'Bank',
            'bank_code' => 'B1'
        ]);
        
        $visibleBanks = QuestionBank::forUser($user)->get();
        $this->assertCount(0, $visibleBanks, 'Deny-by-default failed: User without structural access roles should not see any records.');
    }

    public function test_abac_grants_access_for_matching_placements(): void
    {
        $org = Organization::forceCreate(['organization_name' => 'Org', 'organization_code' => 'ORG2', 'contact_email' => 'test@test.com', 'status' => 'ACTIVE']);
        $bu = BusinessUnit::forceCreate(['organization_id' => $org->id, 'business_unit_name' => 'BU1', 'business_unit_code' => 'BU1', 'status' => 'ACTIVE']);
        
        $user = User::factory()->create([
            'organization_id' => $org->id,
            'business_unit_id' => $bu->id
        ]);
        
        $role = Role::forceCreate(['role_code' => 'BU_MANAGER', 'role_name' => 'BU Manager']);
        $user->roles()->attach($role);
        
        $bank = QuestionBank::forceCreate([
            'organization_id' => $org->id,
            'business_unit_id' => $bu->id,
            'bank_name' => 'Bank1',
            'bank_code' => 'B1'
        ]);
        
        $otherBank = QuestionBank::forceCreate([
            'organization_id' => $org->id,
            'business_unit_id' => 9999,
            'bank_name' => 'Bank2',
            'bank_code' => 'B2'
        ]);
        
        $visibleBanks = QuestionBank::forUser($user)->get();
        $this->assertCount(1, $visibleBanks, 'ABAC logic failed to grant access to matching placement.');
        $this->assertEquals($bank->id, $visibleBanks->first()->id);
    }

    public function test_question_bank_service_preserves_placement_and_restricts_access(): void
    {
        $org = Organization::forceCreate(['organization_name' => 'Org', 'organization_code' => 'ORG3', 'contact_email' => 'test@test.com', 'status' => 'ACTIVE']);
        $bu = BusinessUnit::forceCreate(['organization_id' => $org->id, 'business_unit_name' => 'BU2', 'business_unit_code' => 'BU2', 'status' => 'ACTIVE']);
        $deptA = \App\Modules\Governance\Models\Department::forceCreate(['organization_id' => $org->id, 'business_unit_id' => $bu->id, 'department_name' => 'Dept A', 'department_code' => 'DEPT_A', 'status' => 'ACTIVE']);
        $deptB = \App\Modules\Governance\Models\Department::forceCreate(['organization_id' => $org->id, 'business_unit_id' => $bu->id, 'department_name' => 'Dept B', 'department_code' => 'DEPT_B', 'status' => 'ACTIVE']);
        
        $role = Role::forceCreate(['role_code' => 'CONTENT_CREATOR', 'role_name' => 'Content Creator']);
        
        $userA = User::factory()->create(['organization_id' => $org->id, 'business_unit_id' => $bu->id, 'department_id' => $deptA->id]);
        $userA->roles()->attach($role);
        
        $userB = User::factory()->create(['organization_id' => $org->id, 'business_unit_id' => $bu->id, 'department_id' => $deptB->id]);
        $userB->roles()->attach($role);
        
        // Use the service to create the QuestionBank as User A
        $service = app(\App\Modules\Assessment\Services\QuestionBankService::class);
        $dto = new \App\Modules\Assessment\DTOs\CreateQuestionBankDto($org->id, 'BANK_A', 'Bank A', 'Desc');
        
        $bank = $service->create($org->id, $dto, $userA->id);
        
        // Assert placement fields were correctly populated from user
        $this->assertEquals($deptA->id, $bank->department_id, 'Service did not populate department_id from creating user');
        
        // Assert User A can access it
        $this->assertTrue($userA->canAccessPlacement($bank), 'User A should access their own created bank');
        
        // Assert User B CANNOT access it
        $this->assertFalse($userB->canAccessPlacement($bank), 'User B should NOT access bank created in another department');
    }
}
