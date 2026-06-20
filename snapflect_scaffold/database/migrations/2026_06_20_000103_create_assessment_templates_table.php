<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_templates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->string('template_code', 50);
            $table->string('template_name', 255);
            $table->unsignedBigInteger('assessment_category_id');
            $table->unsignedBigInteger('assessment_type_id');
            $table->text('description')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_category_id')->references('id')->on('assessment_categories')->restrictOnDelete();
            $table->foreign('assessment_type_id')->references('id')->on('assessment_types')->restrictOnDelete();
            $table->unique(['organization_id', 'template_code'], 'uq_templates_code');
            $table->index('organization_id', 'idx_templates_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_templates');
    }
};
