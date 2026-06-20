const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'snapflect', 'database', 'migrations');
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

const writeMigration = (filename, content) => {
    fs.writeFileSync(path.join(migrationsDir, filename), content);
};

const migrations = [
    {
        name: '2026_06_20_000301_create_assessment_sessions_table.php',
        className: 'CreateAssessmentSessionsTable',
        table: 'assessment_sessions',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_id')->constrained('assessments')->restrictOnDelete();
            $table->foreignId('assessment_version_id')->constrained('assessment_versions')->restrictOnDelete();
            $table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->restrictOnDelete();
            $table->string('session_token', 255);
            $table->string('session_status', 50);
            $table->dateTime('access_started_at')->nullable();
            $table->dateTime('access_expires_at')->nullable();
            $table->dateTime('last_activity_at')->nullable();
            $table->string('ip_address', 100)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('session_status');
            $table->index('access_expires_at');
            $table->index(['organization_id', 'candidate_user_id']);
            $table->index(['organization_id', 'session_status']);
        `
    },
    {
        name: '2026_06_20_000302_create_assessment_attempts_table.php',
        className: 'CreateAssessmentAttemptsTable',
        table: 'assessment_attempts',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_session_id')->constrained('assessment_sessions')->restrictOnDelete();
            $table->foreignId('assessment_id')->constrained('assessments')->restrictOnDelete();
            $table->foreignId('assessment_version_id')->constrained('assessment_versions')->restrictOnDelete();
            $table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->restrictOnDelete();
            $table->integer('attempt_number')->default(1);
            $table->string('status', 50);
            $table->integer('total_questions')->default(0);
            $table->integer('answered_questions')->default(0);
            $table->integer('unanswered_questions')->default(0);
            $table->integer('flagged_questions')->default(0);
            $table->dateTime('started_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->decimal('completion_percentage', 5, 2)->default(0.00);
            $table->integer('remaining_seconds')->default(0);

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('status');
            $table->index(['organization_id', 'status']);
            $table->index(['candidate_user_id', 'status']);
            $table->index(['candidate_user_id', 'assessment_snapshot_id']);
            $table->index(['organization_id', 'candidate_user_id', 'status'], 'idx_attempts_org_cand_status');
            $table->index('submitted_at');
        `
    },
    {
        name: '2026_06_20_000303_create_attempt_sections_table.php',
        className: 'CreateAttemptSectionsTable',
        table: 'attempt_sections',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('blueprint_section_id')->constrained('blueprint_sections')->restrictOnDelete();
            $table->string('section_name', 255);
            $table->integer('display_order');
            $table->integer('total_questions')->default(0);
            $table->integer('answered_questions')->default(0);
            $table->integer('flagged_questions')->default(0);
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('display_order');
            $table->index(['assessment_attempt_id', 'display_order']);
        `
    },
    {
        name: '2026_06_20_000304_create_attempt_questions_table.php',
        className: 'CreateAttemptQuestionsTable',
        table: 'attempt_questions',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('attempt_section_id')->constrained('attempt_sections')->restrictOnDelete();
            $table->uuid('snapshot_question_uuid');
            $table->string('question_code', 100);
            $table->string('question_type', 50);
            $table->string('difficulty_level', 50);
            $table->integer('display_order');
            $table->decimal('max_score', 10, 2)->default(0);
            $table->boolean('is_flagged')->default(false);
            $table->dateTime('viewed_at')->nullable();
            $table->dateTime('answered_at')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('snapshot_question_uuid');
            $table->index('display_order');
            $table->index(['assessment_attempt_id', 'display_order']);
        `
    },
    {
        name: '2026_06_20_000305_create_candidate_answers_table.php',
        className: 'CreateCandidateAnswersTable',
        table: 'candidate_answers',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('attempt_question_id')->constrained('attempt_questions')->restrictOnDelete();
            $table->string('answer_type', 50);
            $table->uuid('selected_option_uuid')->nullable();
            $table->json('selected_option_uuids_json')->nullable();
            $table->longText('text_answer')->nullable();
            $table->decimal('numeric_answer', 18, 4)->nullable();
            $table->json('answer_json')->nullable();
            $table->integer('answer_version')->default(1);
            $table->boolean('is_final_answer')->default(false);
            $table->dateTime('saved_at');

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('saved_at');
            $table->index(['assessment_attempt_id', 'attempt_question_id']);
            $table->index(['organization_id', 'assessment_attempt_id']);
            $table->index(['assessment_attempt_id', 'saved_at']);
        `
    },
    {
        name: '2026_06_20_000306_create_attempt_events_table.php',
        className: 'CreateAttemptEventsTable',
        table: 'attempt_events',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->restrictOnDelete();
            $table->string('event_type', 100);
            $table->string('event_description', 500)->nullable();
            $table->json('event_data_json')->nullable();
            $table->dateTime('event_timestamp');
            $table->string('ip_address', 100)->nullable();
            $table->text('user_agent')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();

            $table->index('event_type');
            $table->index('event_timestamp');
            $table->index(['assessment_attempt_id', 'event_timestamp']);
            $table->index(['organization_id', 'event_timestamp']);
            $table->index(['assessment_attempt_id', 'event_type', 'event_timestamp'], 'idx_events_attempt_type_time');
        `
    },
    {
        name: '2026_06_20_000307_create_attempt_audits_table.php',
        className: 'CreateAttemptAuditsTable',
        table: 'attempt_audits',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->string('entity_name', 100);
            $table->uuid('entity_uuid');
            $table->string('action_type', 100);
            $table->json('old_value_json')->nullable();
            $table->json('new_value_json')->nullable();
            $table->foreignId('changed_by')->nullable();
            $table->dateTime('changed_at');

            $table->index('entity_name');
            $table->index('entity_uuid');
            $table->index('action_type');
            $table->index('changed_at');
            $table->index(['entity_name', 'entity_uuid']);
        `
    },
    {
        name: '2026_06_20_000308_create_attempt_submissions_table.php',
        className: 'CreateAttemptSubmissionsTable',
        table: 'attempt_submissions',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->restrictOnDelete();
            $table->string('submission_reference', 100)->unique();
            $table->string('submission_type', 50);
            $table->dateTime('submitted_at');
            $table->integer('total_answered')->default(0);
            $table->integer('total_unanswered')->default(0);
            $table->integer('final_duration_seconds')->default(0);

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();

            $table->unique('assessment_attempt_id');
            $table->index('submitted_at');
            $table->index(['organization_id', 'submitted_at']);
            $table->index(['assessment_snapshot_id', 'submitted_at']);
        `
    }
];

migrations.forEach(m => {
    const template = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${m.table}', function (Blueprint $table) {
${m.schema}
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${m.table}');
    }
};
`;
    writeMigration(m.name, template);
});

console.log('Sprint 03 Migrations generated.');
