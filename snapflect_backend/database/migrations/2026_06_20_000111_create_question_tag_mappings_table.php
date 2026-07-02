<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_tag_mappings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('tag_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('question_id')->references('id')->on('questions')->restrictOnDelete();
            $table->foreign('tag_id')->references('id')->on('question_tags')->restrictOnDelete();
            $table->unique(['question_id', 'tag_id'], 'uq_question_tag_mapping');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_tag_mappings');
    }
};
