<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('assessment_section_id')->nullable();
            $table->decimal('section_score', 10, 2)->default(0.00);
            $table->decimal('section_percentage', 10, 2)->default(0.00);
            $table->decimal('section_weight', 10, 2)->default(1.00);
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('assessment_section_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('section_scores');
    }
};
