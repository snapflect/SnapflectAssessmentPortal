<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->string('assessment_code', 50);
            $table->string('assessment_name', 255);
            $table->unsignedBigInteger('assessment_category_id');
            $table->unsignedBigInteger('assessment_type_id');
            $table->unsignedBigInteger('template_id')->nullable();
            $table->string('current_state', 30)->default('DRAFT');
            $table->integer('estimated_duration_minutes')->nullable();
            $table->decimal('total_marks', 10, 2)->nullable();
            $table->decimal('pass_percentage', 5, 2)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_published')->default(0);
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_category_id')->references('id')->on('assessment_categories')->restrictOnDelete();
            $table->foreign('assessment_type_id')->references('id')->on('assessment_types')->restrictOnDelete();
            $table->foreign('template_id')->references('id')->on('assessment_templates')->restrictOnDelete();
            $table->unique(['organization_id', 'assessment_code'], 'uq_assessments_code');
            $table->index(['organization_id', 'current_state'], 'idx_assessments_org_state');
            $table->index('is_published', 'idx_assessments_published');
            $table->index('status', 'idx_assessments_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
