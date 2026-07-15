<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_competencies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('competency_id');
            $table->decimal('weight_percentage', 5, 2);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('question_id')->references('id')->on('questions')->restrictOnDelete();
            $table->foreign('competency_id')->references('id')->on('competencies')->restrictOnDelete();
            $table->unique(['question_id', 'competency_id'], 'uq_question_competency');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_competencies');
    }
};

