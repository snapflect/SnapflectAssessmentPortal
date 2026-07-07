<?php

namespace Tests\Feature\Modules\Billing;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Modules\Governance\Models\Organization;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Billing\Models\TenantSubscription;
use App\Modules\Billing\Models\Invoice;
use App\Modules\Security\Models\User;
use Illuminate\Support\Str;
use Database\Seeders\BillingSeeder;

class BillingFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CustomRbacSeeder::class);
        $this->seed(BillingSeeder::class);
    }

    public function test_organization_creation_assigns_default_demo_subscription()
    {
        $admin = User::factory()->create(['organization_id' => 1]);
        $role = \App\Modules\Security\Models\Role::where('role_code', 'PLATFORM_ADMIN')->first();
        \App\Modules\Security\Models\UserRole::create([
            'uuid' => Str::uuid(),
            'user_id' => $admin->id,
            'role_id' => $role->id,
            'created_date' => now()
        ]);

        $response = $this->actingAs($admin)->postJson('/api/v1/governance/organizations', [
            'organization_code' => 'TEST-001',
            'organization_name' => 'Test Org',
            'contact_email' => 'test@test.com'
        ]);

        $response->assertStatus(200);
        
        $org = Organization::where('organization_code', 'TEST-001')->first();
        $orgId = $org->id;

        $this->assertDatabaseHas('tenant_subscriptions', [
            'organization_id' => $orgId,
            'status' => 'TRIALING'
        ]);

        $this->assertDatabaseHas('invoices', [
            'organization_id' => $orgId,
            'amount_due' => 0.00,
            'status' => 'PAID'
        ]);
    }

    public function test_organization_creation_assigns_custom_plan_if_provided()
    {
        $admin = User::factory()->create(['organization_id' => 1]);
        $role = \App\Modules\Security\Models\Role::where('role_code', 'PLATFORM_ADMIN')->first();
        \App\Modules\Security\Models\UserRole::create([
            'uuid' => Str::uuid(),
            'user_id' => $admin->id,
            'role_id' => $role->id,
            'created_date' => now()
        ]);

        $response = $this->actingAs($admin)->postJson('/api/v1/governance/organizations', [
            'organization_code' => 'TEST-002',
            'organization_name' => 'Test Org 2',
            'plan_code' => 'BASIC_1M',
            'payment_reference' => 'PO-999888'
        ]);

        $response->assertStatus(200);
        
        $org = Organization::where('organization_code', 'TEST-002')->first();
        $orgId = $org->id;

        $this->assertDatabaseHas('tenant_subscriptions', [
            'organization_id' => $orgId,
            'status' => 'ACTIVE'
        ]);

        $this->assertDatabaseHas('invoices', [
            'organization_id' => $orgId,
            'amount_due' => 2000.00,
            'status' => 'DRAFT',
            'payment_reference' => 'PO-999888'
        ]);
    }
}
