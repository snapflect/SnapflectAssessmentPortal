<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_submissions', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('assessment_attempt_id')->constrained('assessment_attempts')->restrictOnDelete();
            $table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();
            $table->foreignId('candidate_user_id')->constrained('users')->restrictOnDelete();
            $table->string('submission_reference', 100)->unique();
            $table->string('submission_type', 50);
            $table->dateTime('submitted_at');
            $table->integer('total_answered')->default(0);
            $table->integer('total_unanswered')->default(0);
            $table->integer('final_duration_seconds')->default(0);

            $table->foreignId('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();

            $table->unique('assessment_attempt_id');
            $table->index('submitted_at');
            $table->index(['organization_id', 'submitted_at']);
            $table->index(['assessment_snapshot_id', 'submitted_at']);
        
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_submissions');
    }
};
