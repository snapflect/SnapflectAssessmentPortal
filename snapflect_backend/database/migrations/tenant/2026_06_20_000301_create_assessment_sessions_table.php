<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_sessions', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->index();
            $table->foreignId('assessment_id')->constrained('assessments')->restrictOnDelete();
            $table->foreignId('assessment_version_id')->constrained('assessment_versions')->restrictOnDelete();
            $table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->index();
            $table->string('session_token', 255);
            $table->string('session_status', 50);
            $table->dateTime('access_started_at')->nullable();
            $table->dateTime('access_expires_at')->nullable();
            $table->dateTime('last_activity_at')->nullable();
            $table->string('ip_address', 100)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->foreignId('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();

            $table->index('session_status');
            $table->index('access_expires_at');
            $table->index(['organization_id', 'candidate_user_id']);
            $table->index(['organization_id', 'session_status']);
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_sessions');
    }
};

