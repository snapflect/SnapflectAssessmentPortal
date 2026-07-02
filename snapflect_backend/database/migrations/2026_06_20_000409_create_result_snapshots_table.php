<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('result_snapshots', function (Blueprint $table) {
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
            $table->unique('snapshot_hash', 'idx_result_snapshot_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_snapshots');
    }
};
