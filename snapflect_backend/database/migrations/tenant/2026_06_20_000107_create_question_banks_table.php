<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_banks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->string('bank_code', 50);
            $table->string('bank_name', 255);
            $table->boolean('is_system_bank')->default(0);
            $table->text('description')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();


            $table->unique(['organization_id', 'bank_code'], 'uq_question_bank_code');
            $table->index('organization_id', 'idx_question_bank_org');
            $table->index('is_system_bank', 'idx_question_bank_system');
            $table->index('status', 'idx_question_bank_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_banks');
    }
};

