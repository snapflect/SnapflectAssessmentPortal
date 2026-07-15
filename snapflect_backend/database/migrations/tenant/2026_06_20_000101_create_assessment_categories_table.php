<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_categories', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->string('category_code', 50);
            $table->string('category_name', 255);
            $table->text('description')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();


            $table->unique(['organization_id', 'category_code'], 'uq_assessment_categories_code');
            $table->index('organization_id', 'idx_assessment_categories_org');
            $table->index('status', 'idx_assessment_categories_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_categories');
    }
};

