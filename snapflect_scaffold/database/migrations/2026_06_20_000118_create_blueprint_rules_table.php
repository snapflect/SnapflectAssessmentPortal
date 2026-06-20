<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blueprint_rules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('blueprint_section_id');
            $table->string('difficulty_level', 30)->nullable();
            $table->unsignedBigInteger('tag_id')->nullable();
            $table->unsignedBigInteger('competency_id')->nullable();
            $table->integer('question_count');
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('blueprint_section_id')->references('id')->on('blueprint_sections')->restrictOnDelete();
            $table->foreign('tag_id')->references('id')->on('question_tags')->restrictOnDelete();
            $table->foreign('competency_id')->references('id')->on('competencies')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blueprint_rules');
    }
};
