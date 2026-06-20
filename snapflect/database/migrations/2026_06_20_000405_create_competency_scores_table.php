<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competency_scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('competency_id');
            $table->decimal('competency_score', 10, 2)->default(0.00);
            $table->decimal('competency_percentage', 10, 2)->default(0.00);
            $table->decimal('threshold_score', 10, 2)->default(0.00);
            $table->enum('competency_status', ['PASS', 'FAIL'])->default('FAIL');
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
            $table->foreign('competency_id')->references('id')->on('competencies')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('competency_id');
            $table->index('competency_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competency_scores');
    }
};
