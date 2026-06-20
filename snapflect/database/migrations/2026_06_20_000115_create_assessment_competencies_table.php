<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_competencies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('assessment_id');
            $table->unsignedBigInteger('competency_id');
            $table->decimal('target_percentage', 5, 2);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->foreign('assessment_id')->references('id')->on('assessments')->restrictOnDelete();
            $table->foreign('competency_id')->references('id')->on('competencies')->restrictOnDelete();
            $table->unique(['assessment_id', 'competency_id'], 'uq_assessment_competency');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_competencies');
    }
};
