<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('result_publications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->enum('publication_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])->default('DRAFT');
            $table->unsignedBigInteger('published_by')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->unsignedBigInteger('archived_by')->nullable();
            $table->dateTime('archived_at')->nullable();
            $table->text('publication_notes')->nullable();
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();


            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();


            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('publication_status');
            $table->index(['organization_id', 'publication_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_publications');
    }
};

