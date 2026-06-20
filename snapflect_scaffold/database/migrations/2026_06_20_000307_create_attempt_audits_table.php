<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_audits', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->string('entity_name', 100);
            $table->uuid('entity_uuid');
            $table->string('action_type', 100);
            $table->json('old_value_json')->nullable();
            $table->json('new_value_json')->nullable();
            $table->foreignId('changed_by')->nullable();
            $table->dateTime('changed_at');

            $table->index('entity_name');
            $table->index('entity_uuid');
            $table->index('action_type');
            $table->index('changed_at');
            $table->index(['entity_name', 'entity_uuid']);
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_audits');
    }
};
