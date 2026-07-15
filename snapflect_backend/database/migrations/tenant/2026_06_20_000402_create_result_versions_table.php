<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('result_versions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->integer('version_number');
            $table->string('version_label', 100);
            $table->string('version_reason', 500)->nullable();
            $table->boolean('is_current_version')->default(1);
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();


            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();

            $table->index('uuid');
            $table->index(['assessment_result_id', 'version_number']);
            $table->index(['assessment_result_id', 'is_current_version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_versions');
    }
};

