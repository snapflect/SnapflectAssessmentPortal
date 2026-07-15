<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidate_answers', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->index();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('attempt_question_id')->constrained('attempt_questions')->restrictOnDelete();
            $table->string('answer_type', 50);
            $table->uuid('selected_option_uuid')->nullable();
            $table->json('selected_option_uuids_json')->nullable();
            $table->longText('text_answer')->nullable();
            $table->decimal('numeric_answer', 18, 4)->nullable();
            $table->json('answer_json')->nullable();
            $table->integer('answer_version')->default(1);
            $table->boolean('is_final_answer')->default(false);
            $table->dateTime('saved_at');

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('saved_at');
            $table->index(['assessment_attempt_id', 'attempt_question_id']);
            $table->index(['organization_id', 'assessment_attempt_id']);
            $table->index(['assessment_attempt_id', 'saved_at']);
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_answers');
    }
};

