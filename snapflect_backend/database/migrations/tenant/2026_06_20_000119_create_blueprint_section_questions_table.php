<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blueprint_section_questions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('blueprint_section_id');
            $table->unsignedBigInteger('question_id');
            $table->integer('display_order');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('blueprint_section_id')->references('id')->on('blueprint_sections')->restrictOnDelete();
            $table->foreign('question_id')->references('id')->on('questions')->restrictOnDelete();
            $table->unique(['blueprint_section_id', 'question_id'], 'uq_section_question');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blueprint_section_questions');
    }
};

