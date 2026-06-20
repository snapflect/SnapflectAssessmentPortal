<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('result_rules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->string('rule_name', 255);
            $table->enum('rule_type', ['GLOBAL', 'SECTION', 'COMPETENCY', 'COMPOSITE']);
            $table->text('rule_expression');
            $table->boolean('rule_result')->default(0);
            $table->text('evaluation_notes')->nullable();
            $table->string('status', 50)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('rule_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_rules');
    }
};
