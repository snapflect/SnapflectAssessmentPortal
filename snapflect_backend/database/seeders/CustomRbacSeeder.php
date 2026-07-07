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
                'Security.Roles.View', 'Security.Roles.Manage', 'Security.Permissions.View', 'Security.Permissions.Assign'
            ],
            'Governance' => [
                'Governance.Organizations.View', 'Governance.Organizations.Manage', 
                'Governance.BusinessUnits.View', 'Governance.BusinessUnits.Manage', 
                'Governance.Departments.View', 'Governance.Departments.Manage', 
                'Governance.Locations.View', 'Governance.Locations.Manage'
            ],
            'Assessment' => [
                'Assessment.QuestionBanks.View', 'Assessment.QuestionBanks.Manage', 
                'Assessment.Questions.View', 'Assessment.Questions.Manage', 'Assessment.Questions.Create', 'Assessment.Questions.Review', 
                'Assessment.Competencies.View', 'Assessment.Competencies.Manage', 
                'Assessment.Catalog.View', 'Assessment.Catalog.Manage', 
                'Assessment.Blueprints.View', 'Assessment.Blueprints.Manage', 
                'Assessment.Publications.View', 'Assessment.Publications.Manage',
                'Assessment.Metadata.Manage'
            ],
            'Delivery' => [
                'Delivery.Sessions.View', 'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate', 'Delivery.MyAssessments.Take'
            ],
            'Results' => [
                'Results.Analytics.View', 'Results.Analytics.Export', 'Results.ManualScoring.Score', 
                'Results.MyResults.View', 'Results.AllResults.View', 'Results.Certificates.View', 'Results.Certificates.Manage'
            ],
            'Billing' => [
                'Billing.Invoices.View', 'Billing.Subscription.Manage'
            ],
            'Support' => [
                'Support.Tickets.View', 'Support.Tickets.Manage', 'Support.Tickets.Create'
            ]
        ];

        $roleAssignments = [
            'CLIENT_ADMIN' => [
                'Security.Users.View', 'Security.Users.Manage', 'Security.Roles.View', 'Security.Roles.Manage', 'Security.Permissions.View', 'Security.Permissions.Assign',
                'Governance.BusinessUnits.View', 'Governance.BusinessUnits.Manage', 'Governance.Departments.View', 'Governance.Departments.Manage', 'Governance.Locations.View', 'Governance.Locations.Manage',
                'Assessment.QuestionBanks.View', 'Assessment.QuestionBanks.Manage', 'Assessment.Questions.View', 'Assessment.Questions.Manage', 'Assessment.Questions.Create', 'Assessment.Questions.Review', 'Assessment.Competencies.View', 'Assessment.Competencies.Manage', 'Assessment.Catalog.View', 'Assessment.Catalog.Manage', 'Assessment.Blueprints.View', 'Assessment.Blueprints.Manage', 'Assessment.Publications.View', 'Assessment.Publications.Manage',
                'Assessment.Metadata.Manage',
                'Delivery.Sessions.View', 'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate',
                'Results.Analytics.View', 'Results.Analytics.Export', 'Results.ManualScoring.Score', 'Results.AllResults.View', 'Results.Certificates.View', 'Results.Certificates.Manage',
                'Billing.Invoices.View', 'Billing.Subscription.Manage',
                'Support.Tickets.View', 'Support.Tickets.Manage', 'Support.Tickets.Create'
            ],
            'ASSESSMENT_MANAGER' => [
                'Assessment.QuestionBanks.View', 'Assessment.QuestionBanks.Manage', 'Assessment.Questions.View', 'Assessment.Questions.Manage', 'Assessment.Questions.Create', 'Assessment.Questions.Review', 'Assessment.Competencies.View', 'Assessment.Competencies.Manage', 'Assessment.Catalog.View', 'Assessment.Catalog.Manage', 'Assessment.Blueprints.View', 'Assessment.Blueprints.Manage', 'Assessment.Publications.View', 'Assessment.Publications.Manage',
                'Results.Analytics.View', 'Results.Analytics.Export', 'Results.ManualScoring.Score', 'Results.AllResults.View',
                'Support.Tickets.Create'
            ],
            'CONTENT_CREATOR' => [
                'Assessment.QuestionBanks.View', 'Assessment.QuestionBanks.Manage', 'Assessment.Questions.View', 'Assessment.Questions.Create', 'Assessment.Competencies.View', 'Assessment.Competencies.Manage', 'Assessment.Catalog.View', 'Assessment.Catalog.Manage',
                'Support.Tickets.Create'
            ],
            'REVIEWER' => [
                'Assessment.Questions.View', 'Assessment.Questions.Review', 'Results.ManualScoring.Score',
                'Support.Tickets.Create'
            ],
            'CANDIDATE' => [
                'Delivery.MyAssessments.Take', 'Results.MyResults.View', 'Results.Certificates.View',
                'Support.Tickets.Create'
            ],
            'PROCTOR' => [
                'Delivery.Sessions.View', 'Delivery.Sessions.Proctor', 'Delivery.Sessions.Terminate',
                'Support.Tickets.Create'
            ],
            'SUPPORT' => [
                'Security.Users.View', 'Delivery.Sessions.View', 'Delivery.Sessions.Proctor',
                'Support.Tickets.View', 'Support.Tickets.Manage', 'Support.Tickets.Create'
            ],
            'BILLING_ADMIN' => [
                'Billing.Invoices.View', 'Billing.Subscription.Manage',
                'Support.Tickets.Create'
            ],
            'READ_ONLY' => [
                'Governance.Organizations.View', 'Governance.BusinessUnits.View', 'Governance.Departments.View', 'Governance.Locations.View',
                'Security.Users.View', 'Security.Roles.View', 'Security.Permissions.View',
                'Assessment.QuestionBanks.View', 'Assessment.Questions.View', 'Assessment.Competencies.View', 'Assessment.Catalog.View', 'Assessment.Blueprints.View', 'Assessment.Publications.View',
                'Results.AllResults.View', 'Results.Analytics.View',
                'Support.Tickets.Create',
                'Delivery.Sessions.View', 'Billing.Invoices.View'
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
