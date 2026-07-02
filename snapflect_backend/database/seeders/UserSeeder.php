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
        $roles = DB::table('roles')->get();
        $adminUserId = null;

        foreach ($roles as $role) {
            $isPlatformAdmin = $role->role_code === 'PLATFORM_ADMIN';
            $emailPrefix = $isPlatformAdmin ? 'admin' : strtolower($role->role_code);
            $email = $emailPrefix . '@snapflect.com';
            
            // Generate First and Last Name based on role
            $nameParts = explode(' ', $role->role_name);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? implode(' ', array_slice($nameParts, 1)) : 'User';

            $userId = DB::table('users')->insertGetId([
                'uuid' => Str::uuid(),
                'organization_id' => $orgId,
                'business_unit_id' => $buId,
                'department_id' => $deptId,
                'location_id' => $locId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'ChangeMeImmediately')),
                'status' => 'ACTIVE',
                'created_date' => now(),
            ]);

            DB::table('user_profiles')->insert([
                'uuid' => Str::uuid(),
                'user_id' => $userId,
                'company' => 'Snapflect',
                'designation' => $role->role_name,
                'created_date' => now(),
            ]);

            DB::table('user_roles')->insert([
                'uuid' => Str::uuid(),
                'user_id' => $userId,
                'role_id' => $role->id,
                'created_date' => now(),
            ]);
            
            if ($isPlatformAdmin) {
                $adminUserId = $userId;
            }
        }
        
        // Update audit fields for the seeder data using the admin user ID
        DB::table('organizations')->where('id', $orgId)->update(['created_by' => $adminUserId]);
        DB::table('business_units')->where('id', $buId)->update(['created_by' => $adminUserId]);
        DB::table('departments')->where('id', $deptId)->update(['created_by' => $adminUserId]);
        DB::table('locations')->where('id', $locId)->update(['created_by' => $adminUserId]);
        DB::table('users')->update(['created_by' => $adminUserId]); // Update all seeded users
        DB::table('roles')->update(['created_by' => $adminUserId]);
        DB::table('permissions')->update(['created_by' => $adminUserId]);
        DB::table('role_permissions')->update(['created_by' => $adminUserId]);
    }
}
