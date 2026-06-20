<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('attempt_question_id');
            $table->decimal('max_score', 10, 2)->default(0.00);
            $table->decimal('awarded_score', 10, 2)->default(0.00);
            $table->decimal('percentage', 10, 2)->default(0.00);
            $table->enum('scoring_type', ['AUTO', 'MANUAL', 'HYBRID'])->default('AUTO');
            $table->text('scoring_notes')->nullable();
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
            $table->foreign('question_id')->references('id')->on('questions')->restrictOnDelete();
            $table->foreign('attempt_question_id')->references('id')->on('attempt_questions')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('question_id');
            $table->index('scoring_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_scores');
    }
};
