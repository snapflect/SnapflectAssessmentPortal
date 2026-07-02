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
            $existing = DB::table('roles')->where('role_code', $code)->first();
            if ($existing) {
                $roleIds[$code] = $existing->id;
            } else {
                $roleIds[$code] = DB::table('roles')->insertGetId([
                    'uuid' => Str::uuid(),
                    'role_code' => $code,
                    'role_name' => $name,
                    'is_system_role' => true,
                    'status' => 'ACTIVE',
                    'created_date' => now(),
                ]);
            }
        }

        $permissions = [
            'Security' => [
                'Security.Users.View', 'Security.Users.Manage', 
                'Security.Roles.View', 'Security.Roles.Manage', 'Security.Permissions.Assign'
            ],
            'Governance' => [
                'Governance.Organizations.View', 'Governance.Organizations.Manage', 
                'Governance.BusinessUnits.Manage', 'Governance.Departments.Manage', 'Governance.Locations.Manage'
            ],
            'Assessment' => [
                'Assessment.QuestionBanks.Manage', 'Assessment.Questions.Create', 'Assessment.Questions.Review', 
                'Assessment.Competencies.Manage', 'Assessment.Catalog.Manage', 
                'Assessment.Blueprints.Manage', 'Assessment.Publications.Manage'
            ],
            'Delivery' => [
                'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate', 'Delivery.MyAssessments.Take'
            ],
            'Results' => [
                'Results.Analytics.View', 'Results.Analytics.Export', 'Results.ManualScoring.Score', 
                'Results.MyResults.View', 'Results.Certificates.View'
            ],
            'Billing' => [
                'Billing.Invoices.View', 'Billing.Subscription.Manage'
            ]
        ];

        $roleAssignments = [
            'CLIENT_ADMIN' => [
                'Security.Users.View', 'Security.Users.Manage', 'Security.Roles.View', 'Security.Roles.Manage',
                'Governance.BusinessUnits.Manage', 'Governance.Departments.Manage', 'Governance.Locations.Manage',
                'Assessment.QuestionBanks.Manage', 'Assessment.Questions.Create', 'Assessment.Questions.Review', 'Assessment.Competencies.Manage', 'Assessment.Catalog.Manage', 'Assessment.Blueprints.Manage', 'Assessment.Publications.Manage',
                'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate',
                'Results.Analytics.View', 'Results.Analytics.Export', 'Results.ManualScoring.Score',
                'Billing.Invoices.View', 'Billing.Subscription.Manage'
            ],
            'ASSESSMENT_MANAGER' => [
                'Assessment.QuestionBanks.Manage', 'Assessment.Questions.Create', 'Assessment.Questions.Review', 'Assessment.Competencies.Manage', 'Assessment.Catalog.Manage', 'Assessment.Blueprints.Manage', 'Assessment.Publications.Manage',
                'Results.Analytics.View', 'Results.Analytics.Export', 'Results.ManualScoring.Score'
            ],
            'CONTENT_CREATOR' => [
                'Assessment.QuestionBanks.Manage', 'Assessment.Questions.Create', 'Assessment.Competencies.Manage', 'Assessment.Catalog.Manage'
            ],
            'REVIEWER' => [
                'Assessment.Questions.Review', 'Results.ManualScoring.Score'
            ],
            'CANDIDATE' => [
                'Delivery.MyAssessments.Take', 'Results.MyResults.View', 'Results.Certificates.View'
            ],
            'PROCTOR' => [
                'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate'
            ],
            'SUPPORT' => [
                'Security.Users.View', 'Delivery.Sessions.Proctor'
            ],
            'BILLING_ADMIN' => [
                'Billing.Invoices.View', 'Billing.Subscription.Manage'
            ],
            'READ_ONLY' => [
                'Governance.Organizations.View'
            ]
        ];

        foreach ($permissions as $module => $perms) {
            foreach ($perms as $perm) {
                $existingPerm = DB::table('permissions')->where('permission_code', $perm)->first();
                if ($existingPerm) {
                    $permId = $existingPerm->id;
                    // Also make sure to update the module in case it was created previously with 'General'
                    DB::table('permissions')->where('id', $permId)->update(['module' => $module]);
                } else {
                    $permId = DB::table('permissions')->insertGetId([
                        'uuid' => Str::uuid(),
                        'permission_code' => $perm,
                        'module' => $module,
                        'status' => 'ACTIVE',
                        'created_date' => now(),
                    ]);
                }

                // Grant all to PLATFORM_ADMIN
                DB::table('role_permissions')->updateOrInsert(
                    ['role_id' => $roleIds['PLATFORM_ADMIN'], 'permission_id' => $permId],
                    ['uuid' => Str::uuid(), 'created_date' => now()]
                );

                // Map specific permissions to other roles
                foreach ($roleAssignments as $roleCode => $assignedPerms) {
                    if (in_array($perm, $assignedPerms)) {
                        DB::table('role_permissions')->updateOrInsert(
                            ['role_id' => $roleIds[$roleCode], 'permission_id' => $permId],
                            ['uuid' => Str::uuid(), 'created_date' => now()]
                        );
                    }
                }
            }
        }
    }
}
