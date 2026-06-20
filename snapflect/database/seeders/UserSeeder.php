<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $orgId = DB::table('organizations')->where('organization_code', 'ORG-001')->value('id');
        $buId = DB::table('business_units')->where('business_unit_code', 'BU-001')->value('id');
        $deptId = DB::table('departments')->where('department_code', 'DEPT-001')->value('id');
        $locId = DB::table('locations')->where('location_code', 'LOC-001')->value('id');
        $adminRoleId = DB::table('roles')->where('role_code', 'PLATFORM_ADMIN')->value('id');

        $userId = DB::table('users')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'business_unit_id' => $buId,
            'department_id' => $deptId,
            'location_id' => $locId,
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@snapflect.com',
            'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'ChangeMeImmediately')),
            'status' => 'ACTIVE',
            'created_date' => now(),
        ]);

        DB::table('user_profiles')->insert([
            'uuid' => Str::uuid(),
            'user_id' => $userId,
            'company' => 'Snapflect',
            'designation' => 'System Administrator',
            'created_date' => now(),
        ]);

        DB::table('user_roles')->insert([
            'uuid' => Str::uuid(),
            'user_id' => $userId,
            'role_id' => $adminRoleId,
            'created_date' => now(),
        ]);
        
        // Update audit fields for the seeder data
        DB::table('organizations')->where('id', $orgId)->update(['created_by' => $userId]);
        DB::table('business_units')->where('id', $buId)->update(['created_by' => $userId]);
        DB::table('departments')->where('id', $deptId)->update(['created_by' => $userId]);
        DB::table('locations')->where('id', $locId)->update(['created_by' => $userId]);
        DB::table('users')->where('id', $userId)->update(['created_by' => $userId]);
        DB::table('roles')->update(['created_by' => $userId]);
        DB::table('permissions')->update(['created_by' => $userId]);
        DB::table('role_permissions')->update(['created_by' => $userId]);
    }
}
