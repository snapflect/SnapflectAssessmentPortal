<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manual_score_reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->unsignedBigInteger('question_score_id');
            $table->unsignedBigInteger('reviewed_by');
            $table->enum('review_status', ['PENDING', 'IN_REVIEW', 'COMPLETED'])->default('PENDING');
            $table->decimal('original_score', 10, 2);
            $table->decimal('reviewed_score', 10, 2)->nullable();
            $table->text('review_comments')->nullable();
            $table->dateTime('reviewed_at')->nullable();
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();


            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('question_score_id')->references('id')->on('question_scores')->restrictOnDelete();


            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('review_status');
            $table->index('reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manual_score_reviews');
    }
};

