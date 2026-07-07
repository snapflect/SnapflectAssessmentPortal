<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CandidateDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get Organization and User
        $orgId = DB::table('organizations')->where('organization_code', 'ORG-001')->value('id');
        $candidateUser = DB::table('users')->where('email', 'candidate@snapflect.com')->first();
        $adminUser = DB::table('users')->where('email', 'admin@snapflect.com')->first();
        
        if (!$candidateUser || !$adminUser) {
            return;
        }

        // 1.5 Create Category and Type
        $categoryId = DB::table('assessment_categories')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'category_code' => 'CAT-001',
            'category_name' => 'Demo Category',
            'status' => 'ACTIVE',
            'created_date' => now(),
            'created_by' => $adminUser->id,
        ]);

        $typeId = DB::table('assessment_types')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'type_code' => 'TYP-001',
            'type_name' => 'Demo Type',
            'status' => 'ACTIVE',
            'created_date' => now(),
            'created_by' => $adminUser->id,
        ]);

        // 2. Create Assessment
        $assessmentId = DB::table('assessments')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'assessment_category_id' => $categoryId,
            'assessment_type_id' => $typeId,
            'assessment_name' => 'E2E Demo Assessment',
            'assessment_code' => 'DEMO-E2E-001',
            'description' => 'Assessment for E2E Playwright testing',
            'status' => 'ACTIVE',
            'current_state' => 'PUBLISHED',
            'is_published' => true,
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        // 3. Create Assessment Version
        $versionId = DB::table('assessment_versions')->insertGetId([
            'uuid' => Str::uuid(),
            'assessment_id' => $assessmentId,
            'organization_id' => $orgId,
            'major_version' => 1,
            'minor_version' => 0,
            'version_label' => '1.0',
            'status' => 'PUBLISHED',
            'published_date' => now(),
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        // 3.1 Create Blueprint and Questions
        $blueprintId = DB::table('assessment_blueprints')->insertGetId([
            'uuid' => Str::uuid(),
            'assessment_id' => $assessmentId,
            'organization_id' => $orgId,
            'blueprint_name' => 'E2E Demo Blueprint',
            'status' => 'ACTIVE',
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        $sectionId = DB::table('blueprint_sections')->insertGetId([
            'uuid' => Str::uuid(),
            'blueprint_id' => $blueprintId,
            'section_name' => 'General Knowledge',
            'section_weight' => 100,
            'selection_strategy' => 'ALL',
            'status' => 'ACTIVE',
            'display_order' => 1,
            'description' => 'Demo Description',
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        $bankId = DB::table('question_banks')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'bank_code' => 'BNK-001',
            'bank_name' => 'Demo Bank',
            'status' => 'ACTIVE',
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        $questionId = DB::table('questions')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'question_bank_id' => $bankId,
            'question_code' => 'QST-001',
            'question_text' => 'What is 2+2?',
            'question_type' => 'MCQ',
            'difficulty_level' => 'EASY',
            'status' => 'ACTIVE',
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        DB::table('question_options')->insert([
            ['uuid' => Str::uuid(), 'question_id' => $questionId, 'option_text' => '3', 'is_correct' => false, 'display_order' => 1, 'status' => 'ACTIVE', 'created_by' => $adminUser->id, 'created_date' => now()],
            ['uuid' => Str::uuid(), 'question_id' => $questionId, 'option_text' => '4', 'is_correct' => true, 'display_order' => 2, 'status' => 'ACTIVE', 'created_by' => $adminUser->id, 'created_date' => now()]
        ]);

        DB::table('blueprint_section_questions')->insertGetId([
            'uuid' => Str::uuid(),
            'blueprint_section_id' => $sectionId,
            'question_id' => $questionId,
            'display_order' => 1,
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        $snapshotId = DB::table('assessment_snapshots')->insertGetId([
            'uuid' => Str::uuid(),
            'assessment_id' => $assessmentId,
            'assessment_version_id' => $versionId,
            'organization_id' => $orgId,
            'snapshot_json' => json_encode([
                'title' => 'E2E Demo Assessment',
                'blueprint' => [
                    'sections' => [
                        [
                            'name' => 'General Knowledge',
                            'questions' => [
                                [
                                    'uuid' => Str::uuid(),
                                    'text' => 'What is 2+2?',
                                    'type' => 'MCQ',
                                    'points' => 10,
                                    'options' => [
                                        ['id' => 'opt1', 'text' => '3', 'is_correct' => false],
                                        ['id' => 'opt2', 'text' => '4', 'is_correct' => true]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]),
            'snapshot_hash' => hash('sha256', 'mock_hash_for_e2e'),
            'snapshot_schema_version' => '1.0',
            'published_by' => $adminUser->id,
            'published_date' => now(),
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);


        // 3.5 Create Publication
        $publicationId = DB::table('assessment_publications')->insertGetId([
            'uuid' => Str::uuid(),
            'assessment_id' => $assessmentId,
            'assessment_version_id' => $versionId,
            'assessment_snapshot_id' => $snapshotId,
            'publication_code' => 'PUB-E2E-001',
            'title' => 'E2E Demo Assessment Publication',
            'status' => 'ACTIVE',
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(7),
            'max_attempts' => 1,
            'is_proctored' => false,
            'published_by' => $adminUser->id,
            'published_date' => now(),
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);

        // 4. Create Session (Publication)
        $sessionId = DB::table('assessment_sessions')->insertGetId([
            'uuid' => Str::uuid(),
            'organization_id' => $orgId,
            'assessment_id' => $assessmentId,
            'assessment_version_id' => $versionId,
            'assessment_snapshot_id' => $snapshotId,
            'candidate_user_id' => $candidateUser->id,
            'session_token' => Str::random(32),
            'session_status' => 'DRAFT', 
            'access_started_at' => now()->subDay(),
            'access_expires_at' => now()->addDays(7),
            'created_by' => $adminUser->id,
            'created_date' => now(),
        ]);
    }
}
