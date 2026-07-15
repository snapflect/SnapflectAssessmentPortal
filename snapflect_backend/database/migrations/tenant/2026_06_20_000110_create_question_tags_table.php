<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_tags', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->string('tag_name', 100);
            $table->string('tag_type', 50)->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();


            $table->unique(['organization_id', 'tag_name'], 'uq_question_tag');
            $table->index('organization_id', 'idx_question_tags_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_tags');
    }
};

