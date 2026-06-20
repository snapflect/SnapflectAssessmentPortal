<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('result_audits', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('assessment_result_id');
            $table->enum('audit_type', ['RESULT_CREATED', 'RESULT_UPDATED', 'RESULT_PUBLISHED', 'RESULT_ARCHIVED', 'MANUAL_OVERRIDE']);
            $table->string('audit_description', 1000);
            $table->longText('old_value_json')->nullable();
            $table->longText('new_value_json')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable();
            $table->dateTime('performed_at');

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->restrictOnDelete();
            $table->foreign('performed_by')->references('id')->on('users')->restrictOnDelete();

            $table->index('uuid');
            $table->index('assessment_result_id');
            $table->index('audit_type');
            $table->index('performed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_audits');
    }
};
