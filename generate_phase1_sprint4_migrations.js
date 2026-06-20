const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'snapflect', 'database', 'migrations');
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

// Ensure the filename prefix is sequential
let counter = 1;
const getMigrationFilename = (tableName) => {
    const paddedCounter = String(counter++).padStart(2, '0');
    // Using 00040X for Sprint 4
    return `2026_06_20_0004${paddedCounter}_create_${tableName}_table.php`;
};

const writeMigrationFile = (filename, content) => {
    fs.writeFileSync(path.join(migrationsDir, filename), content);
};

// Generic Audit/Soft Delete fields
const getMutableAuditFields = () => `
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();`;

const migrations = [
    {
        table: 'assessment_results',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_id');
            $table->unsignedBigInteger('assessment_version_id');
            $table->unsignedBigInteger('assessment_snapshot_id');
            $table->unsignedBigInteger('assessment_attempt_id');
            $table->unsignedBigInteger('candidate_user_id');
            $table->string('result_reference', 100);
            $table->integer('result_version')->default(1);
            $table->decimal('overall_score', 10, 2)->default(0.00);
            $table->decimal('overall_percentage', 10, 2)->default(0.00);
            $table->enum('pass_fail_status', ['PASS', 'FAIL', 'INCOMPLETE', 'PENDING_REVIEW'])->default('PENDING_REVIEW');
            $table->enum('result_status', ['PENDING', 'CALCULATING', 'READY', 'PUBLISHED', 'ARCHIVED'])->default('PENDING');
            $table->dateTime('calculated_at')->nullable();
            $table->dateTime('published_at')->nullable();${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->foreign('assessment_version_id')->references('id')->on('assessment_versions')->restrictOnDelete();
            $table->foreign('assessment_snapshot_id')->references('id')->on('assessment_snapshots')->restrictOnDelete();
            $table->foreign('assessment_attempt_id')->references('id')->on('assessment_attempts')->restrictOnDelete();
            $table->foreign('candidate_user_id')->references('id')->on('users')->restrictOnDelete();

            $table->index('uuid');
            $table->index('organization_id');
            $table->index('result_status');
            $table->index('pass_fail_status');
            $table->index(['organization_id', 'candidate_user_id']);
            $table->index(['organization_id', 'assessment_id']);`
    },
    {
        table: 'result_versions',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->integer('version_number');
            $table->string('version_label', 100);
            $table->string('version_reason', 500)->nullable();
            $table->boolean('is_current_version')->default(1);${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();

            $table->index('uuid');
            $table->index(['assessment_result_id', 'version_number']);
            $table->index(['assessment_result_id', 'is_current_version']);`
    },
    {
        table: 'question_scores',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('attempt_question_id');
            $table->decimal('max_score', 10, 2)->default(0.00);
            $table->decimal('awarded_score', 10, 2)->default(0.00);
            $table->decimal('percentage', 10, 2)->default(0.00);
            $table->enum('scoring_type', ['AUTO', 'MANUAL', 'HYBRID'])->default('AUTO');
            $table->text('scoring_notes')->nullable();${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('question_id')->references('id')->on('questions')->restrictOnDelete();
            $table->foreign('attempt_question_id')->references('id')->on('attempt_questions')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('question_id');
            $table->index('scoring_type');`
    },
    {
        table: 'section_scores',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('assessment_section_id');
            $table->decimal('section_score', 10, 2)->default(0.00);
            $table->decimal('section_percentage', 10, 2)->default(0.00);
            $table->decimal('section_weight', 10, 2)->default(1.00);${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('assessment_section_id');`
    },
    {
        table: 'competency_scores',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('competency_id');
            $table->decimal('competency_score', 10, 2)->default(0.00);
            $table->decimal('competency_percentage', 10, 2)->default(0.00);
            $table->decimal('threshold_score', 10, 2)->default(0.00);
            $table->enum('competency_status', ['PASS', 'FAIL'])->default('FAIL');${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('competency_id')->references('id')->on('competencies')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('competency_id');
            $table->index('competency_status');`
    },
    {
        table: 'result_rules',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->string('rule_name', 255);
            $table->enum('rule_type', ['GLOBAL', 'SECTION', 'COMPETENCY', 'COMPOSITE']);
            $table->text('rule_expression');
            $table->boolean('rule_result')->default(0);
            $table->text('evaluation_notes')->nullable();${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('rule_type');`
    },
    {
        table: 'result_publications',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->enum('publication_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])->default('DRAFT');
            $table->unsignedBigInteger('published_by')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->unsignedBigInteger('archived_by')->nullable();
            $table->dateTime('archived_at')->nullable();
            $table->text('publication_notes')->nullable();${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('published_by')->references('id')->on('users')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('publication_status');
            $table->index(['organization_id', 'publication_status']);`
    },
    {
        table: 'result_audits',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->enum('audit_type', ['RESULT_CREATED', 'RESULT_UPDATED', 'RESULT_PUBLISHED', 'RESULT_ARCHIVED', 'MANUAL_OVERRIDE']);
            $table->string('audit_description', 1000);
            $table->longText('old_value_json')->nullable();
            $table->longText('new_value_json')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable();
            $table->dateTime('performed_at');

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('performed_by')->references('id')->on('users')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('audit_type');
            $table->index('performed_at');`
    },
    {
        table: 'result_snapshots',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('result_version_id');
            $table->char('snapshot_hash', 64);
            $table->longText('snapshot_json');
            $table->longText('rules_snapshot_json');
            $table->dateTime('calculated_at');

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('result_version_id')->references('id')->on('result_versions')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('result_version_id');
            $table->unique('snapshot_hash', 'idx_result_snapshot_hash');`
    },
    {
        table: 'manual_score_reviews',
        schema: `
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('question_score_id');
            $table->unsignedBigInteger('reviewed_by');
            $table->enum('review_status', ['PENDING', 'IN_REVIEW', 'COMPLETED'])->default('PENDING');
            $table->decimal('original_score', 10, 2);
            $table->decimal('reviewed_score', 10, 2)->nullable();
            $table->text('review_comments')->nullable();
            $table->dateTime('reviewed_at')->nullable();${getMutableAuditFields()}

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('question_score_id')->references('id')->on('question_scores')->restrictOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('review_status');
            $table->index('reviewed_by');`
    }
];

const template = (table, schema) => `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${table}', function (Blueprint $table) {${schema}
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${table}');
    }
};
`;

migrations.forEach(mig => {
    writeMigrationFile(getMigrationFilename(mig.table), template(mig.table, mig.schema));
});

console.log('Sprint 04 Phase 1 Migrations generated successfully.');
