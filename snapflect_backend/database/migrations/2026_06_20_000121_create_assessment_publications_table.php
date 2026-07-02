<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_publications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('assessment_id');
            $table->unsignedBigInteger('assessment_version_id');
            $table->unsignedBigInteger('assessment_snapshot_id');
            $table->unsignedBigInteger('published_by');
            $table->timestamp('published_date');
            $table->longText('publication_notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->foreign('assessment_version_id')->references('id')->on('assessment_versions')->restrictOnDelete();
            $table->foreign('assessment_snapshot_id')->references('id')->on('assessment_snapshots')->restrictOnDelete();
            $table->index('published_date', 'idx_publication_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_publications');
    }
};
