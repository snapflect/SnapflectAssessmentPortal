<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_results', function (Blueprint $table) {
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
            $table->dateTime('published_at')->nullable();
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();


            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->foreign('assessment_version_id')->references('id')->on('assessment_versions')->restrictOnDelete();
            $table->foreign('assessment_snapshot_id')->references('id')->on('assessment_snapshots')->restrictOnDelete();
            $table->foreign('assessment_attempt_id')->references('id')->on('assessment_attempts')->restrictOnDelete();


            $table->index('uuid');
            $table->index('organization_id');
            $table->index('result_status');
            $table->index('pass_fail_status');
            $table->index(['organization_id', 'candidate_user_id']);
            $table->index(['organization_id', 'assessment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_results');
    }
};

