<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_snapshots', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_id');
            $table->unsignedBigInteger('assessment_version_id');
            $table->longText('snapshot_json');
            $table->string('snapshot_hash', 255);
            $table->unsignedBigInteger('published_by');
            $table->timestamp('published_date');
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->foreign('assessment_version_id')->references('id')->on('assessment_versions')->restrictOnDelete();
            $table->index('assessment_id', 'idx_snapshots_assessment');
            $table->index('assessment_version_id', 'idx_snapshots_version');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_snapshots');
    }
};
