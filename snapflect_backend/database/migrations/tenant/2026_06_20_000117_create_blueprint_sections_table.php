<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blueprint_sections', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('blueprint_id');
            $table->string('section_name', 255);
            $table->integer('display_order');
            $table->integer('section_duration_minutes')->nullable();
            $table->decimal('section_weight', 5, 2)->nullable();
            $table->string('selection_strategy', 30);
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->foreign('blueprint_id')->references('id')->on('assessment_blueprints')->restrictOnDelete();
            $table->index(['blueprint_id', 'display_order'], 'idx_blueprint_section_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blueprint_sections');
    }
};

