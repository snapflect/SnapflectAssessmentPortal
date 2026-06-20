<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_events', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->restrictOnDelete();
            $table->string('event_type', 100);
            $table->string('event_description', 500)->nullable();
            $table->json('event_data_json')->nullable();
            $table->dateTime('event_timestamp');
            $table->string('ip_address', 100)->nullable();
            $table->text('user_agent')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();

            $table->index('event_type');
            $table->index('event_timestamp');
            $table->index(['assessment_attempt_id', 'event_timestamp']);
            $table->index(['organization_id', 'event_timestamp']);
            $table->index(['assessment_attempt_id', 'event_type', 'event_timestamp'], 'idx_events_attempt_type_time');
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_events');
    }
};
