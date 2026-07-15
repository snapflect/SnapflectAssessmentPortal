<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_versions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_id');
            $table->integer('major_version');
            $table->integer('minor_version');
            $table->string('version_label', 20);
            $table->text('change_summary')->nullable();
            $table->unsignedBigInteger('parent_version_id')->nullable();
            $table->timestamp('published_date')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();


            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->foreign('parent_version_id')->references('id')->on('assessment_versions')->restrictOnDelete();
            $table->unique(['assessment_id', 'major_version', 'minor_version'], 'uq_assessment_version');
            $table->index('organization_id', 'idx_assessment_versions_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_versions');
    }
};

