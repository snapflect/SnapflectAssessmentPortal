<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tenant;
use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Models\BusinessUnit;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class TenantIsolationTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        
        // Setup Central DB manually in memory
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->string('organization_code');
            $table->string('organization_name');
            $table->string('legal_name');
            $table->string('contact_email');
            $table->string('country');
            $table->string('timezone');
            $table->string('status');
            $table->timestamp('created_date')->nullable();
            $table->timestamp('modified_date')->nullable();
        });
        
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->timestamps();
            $table->json('data')->nullable();
        });
        
        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->string('domain')->unique();
            $table->string('tenant_id');
            $table->timestamps();
        });
    }

    public function tearDown(): void
    {
        if (file_exists(database_path('tenanttenant-a-test'))) {
            unlink(database_path('tenanttenant-a-test'));
        }
        if (file_exists(database_path('tenanttenant-b-test'))) {
            unlink(database_path('tenanttenant-b-test'));
        }
        
        parent::tearDown();
    }

    public function test_tenant_data_is_isolated_between_databases(): void
    {
        // Disable tenancy events so we don't trigger full DB migrations on SQLite memory DBs
        Event::fake([
            \Stancl\Tenancy\Events\TenantCreated::class,
            \Stancl\Tenancy\Events\DatabaseCreated::class,
            \Stancl\Tenancy\Events\DatabaseMigrated::class
        ]);

        $orgA = Organization::create([
            'uuid' => (string) Str::uuid(),
            'organization_code' => 'tenant-a-test',
            'organization_name' => 'Tenant A Corp',
            'legal_name' => 'Tenant A LLC',
            'contact_email' => 'admin@tenanta.com',
            'country' => 'US',
            'timezone' => 'UTC',
            'status' => 'ACTIVE'
        ]);
        
        $tenantA = Tenant::create(['id' => 'tenant-a-test']);
        file_put_contents(database_path('tenanttenant-a-test'), '');

        $orgB = Organization::create([
            'uuid' => (string) Str::uuid(),
            'organization_code' => 'tenant-b-test',
            'organization_name' => 'Tenant B Corp',
            'legal_name' => 'Tenant B LLC',
            'contact_email' => 'admin@tenantb.com',
            'country' => 'UK',
            'timezone' => 'UTC',
            'status' => 'ACTIVE'
        ]);

        $tenantB = Tenant::create(['id' => 'tenant-b-test']);
        file_put_contents(database_path('tenanttenant-b-test'), '');

        // Setup Tenant A DB Schema
        tenancy()->initialize($tenantA);
        Schema::create('business_units', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->unsignedBigInteger('organization_id');
            $table->string('business_unit_code');
            $table->string('business_unit_name');
            $table->string('status')->default('ACTIVE');
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('created_date')->nullable();
            $table->timestamp('modified_date')->nullable();
            $table->timestamp('deleted_date')->nullable();
        });
        
        BusinessUnit::create([
            'uuid' => (string) Str::uuid(),
            'organization_id' => $orgA->id,
            'business_unit_code' => 'BU-A',
            'business_unit_name' => 'Tenant A BU'
        ]);

        $this->assertEquals(1, BusinessUnit::count());
        $this->assertEquals('Tenant A BU', BusinessUnit::first()->business_unit_name);
        tenancy()->end();

        // Setup Tenant B DB Schema
        tenancy()->initialize($tenantB);
        Schema::create('business_units', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->unsignedBigInteger('organization_id');
            $table->string('business_unit_code');
            $table->string('business_unit_name');
            $table->string('status')->default('ACTIVE');
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('created_date')->nullable();
            $table->timestamp('modified_date')->nullable();
            $table->timestamp('deleted_date')->nullable();
        });
        
        BusinessUnit::create([
            'uuid' => (string) Str::uuid(),
            'organization_id' => $orgB->id,
            'business_unit_code' => 'BU-B',
            'business_unit_name' => 'Tenant B BU'
        ]);

        $this->assertEquals(1, BusinessUnit::count());
        $this->assertEquals('Tenant B BU', BusinessUnit::first()->business_unit_name);
        tenancy()->end();
        
        // Assert isolation holds true
        tenancy()->initialize($tenantA);
        $this->assertEquals(1, BusinessUnit::count());
        $this->assertEquals('Tenant A BU', BusinessUnit::first()->business_unit_name);
        tenancy()->end();
    }
}
