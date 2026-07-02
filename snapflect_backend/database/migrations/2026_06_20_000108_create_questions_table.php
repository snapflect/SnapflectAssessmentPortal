<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('question_bank_id');
            $table->string('question_code', 50);
            $table->string('question_type', 50);
            $table->string('difficulty_level', 30);
            $table->longText('question_text');
            $table->longText('explanation')->nullable();
            $table->decimal('max_score', 10, 2)->default(1.00);
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('question_bank_id')->references('id')->on('question_banks')->restrictOnDelete();
            $table->unique(['organization_id', 'question_code'], 'uq_question_code');
            $table->index('question_bank_id', 'idx_question_bank');
            $table->index('question_type', 'idx_question_type');
            $table->index('difficulty_level', 'idx_question_difficulty');
            $table->index(['organization_id', 'status'], 'idx_question_org_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
