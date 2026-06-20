<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomRbacSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'PLATFORM_ADMIN' => 'Platform Administrator',
            'ASSESSMENT_MANAGER' => 'Assessment Manager',
            'CONTENT_CREATOR' => 'Content Creator',
            'REVIEWER' => 'Reviewer',
            'CANDIDATE' => 'Candidate',
            'CLIENT_ADMIN' => 'Client Admin',
            'PROCTOR' => 'Proctor',
            'BILLING_ADMIN' => 'Billing Admin',
            'READ_ONLY' => 'Read Only',
            'SUPPORT' => 'Support',
        ];

        $roleIds = [];
        foreach ($roles as $code => $name) {
            $roleIds[$code] = DB::table('roles')->insertGetId([
                'uuid' => Str::uuid(),
                'role_code' => $code,
                'role_name' => $name,
                'is_system_role' => true,
                'status' => 'ACTIVE',
                'created_date' => now(),
            ]);
        }

        $permissions = [
            'Security' => ['User.View', 'User.Create', 'User.Edit', 'User.Delete', 'Role.View', 'Role.Manage'],
            'Governance' => ['Organization.View', 'Organization.Manage', 'Department.View', 'Department.Manage'],
        ];

        foreach ($permissions as $module => $perms) {
            foreach ($perms as $perm) {
                $permId = DB::table('permissions')->insertGetId([
                    'uuid' => Str::uuid(),
                    'permission_code' => $perm,
                    'module' => $module,
                    'status' => 'ACTIVE',
                    'created_date' => now(),
                ]);

                // Grant all to PLATFORM_ADMIN
                DB::table('role_permissions')->insert([
                    'uuid' => Str::uuid(),
                    'role_id' => $roleIds['PLATFORM_ADMIN'],
                    'permission_id' => $permId,
                    'created_date' => now(),
                ]);
            }
        }
    }
}
