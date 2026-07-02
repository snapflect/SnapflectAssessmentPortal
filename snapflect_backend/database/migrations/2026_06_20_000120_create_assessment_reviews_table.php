<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('assessment_id');
            $table->string('review_status', 30);
            $table->longText('review_comments')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_date')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->index('review_status', 'idx_assessment_review_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_reviews');
    }
};
