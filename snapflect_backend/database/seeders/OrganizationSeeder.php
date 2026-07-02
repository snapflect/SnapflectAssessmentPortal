<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $orgId = DB::table('organizations')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_code' => 'ORG-001',
            'organization_name' => 'Snapflect Assessment Portal',
            'legal_name' => 'Snapflect Inc.',
            'contact_email' => 'admin@snapflect.com',
            'country' => 'USA',
            'timezone' => 'UTC',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        $buId = DB::table('business_units')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'business_unit_code' => 'BU-001',
            'business_unit_name' => 'Core Operations',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        DB::table('departments')->insert([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'business_unit_id' => $buId,
            'department_code' => 'DEPT-001',
            'department_name' => 'Engineering',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        DB::table('locations')->insert([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'location_code' => 'LOC-001',
            'location_name' => 'Headquarters',
            'city' => 'San Francisco',
            'country' => 'USA',
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);
    }
}
