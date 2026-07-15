<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_questions', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->index();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('attempt_section_id')->constrained('attempt_sections')->restrictOnDelete();
            $table->uuid('snapshot_question_uuid');
            $table->string('question_code', 100);
            $table->string('question_type', 50);
            $table->string('difficulty_level', 50);
            $table->integer('display_order');
            $table->decimal('max_score', 10, 2)->default(0);
            $table->boolean('is_flagged')->default(false);
            $table->dateTime('viewed_at')->nullable();
            $table->dateTime('answered_at')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('snapshot_question_uuid');
            $table->index('display_order');
            $table->index(['assessment_attempt_id', 'display_order']);
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_questions');
    }
};

