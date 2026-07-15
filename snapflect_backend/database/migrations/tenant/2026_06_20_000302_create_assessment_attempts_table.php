<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_attempts', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->index();
            $table->foreignId('assessment_session_id')->constrained('assessment_sessions')->restrictOnDelete();
            $table->foreignId('assessment_id')->constrained('assessments')->restrictOnDelete();
            $table->foreignId('assessment_version_id')->constrained('assessment_versions')->restrictOnDelete();
            $table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->index();
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
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_attempts');
    }
};

