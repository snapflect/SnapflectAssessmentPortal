<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Governance\Models\Organization;
use App\Models\Tenant;

abstract class TenancyTestCase extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization;
    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->setUpTenancy();
    }

    protected function setUpTenancy(): void
    {
        // 1. Ensure any previous tenant context is cleared
        tenancy()->end();

        // 2. Prevent Stancl/Tenancy from trying to create a physical SQLite file 
        // and running migrations since RefreshDatabase already migrated everything!
        \Illuminate\Support\Facades\Event::forget(\Stancl\Tenancy\Events\TenantCreated::class);

        // 3. Create the organization in the central database
        $this->organization = Organization::factory()->create();

        // 4. Create the Tenant
        $this->tenant = Tenant::create([
            'id' => (string) $this->organization->id,
        ]);

        // 5. Initialize tenancy so subsequent Eloquent calls use the tenant DB
        tenancy()->initialize($this->tenant);

        // 6. THE MAGIC FIX: Force the 'tenant' connection to use the EXACT SAME in-memory 
        // PDO instance as the central database. This completely eliminates SQLite 
        // cross-database 'no such table' errors!
        \Illuminate\Support\Facades\DB::connection('tenant')->setPdo(
            \Illuminate\Support\Facades\DB::connection(config('tenancy.database.central_connection'))->getPdo()
        );
    }

    protected function tearDown(): void
    {
        tenancy()->end();
        parent::tearDown();
    }
}
