<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('blueprint_rules', function (Blueprint $table) {
            $table->string('question_type', 50)->nullable()->after('difficulty_level');
            $table->integer('points_per_question')->default(1)->after('question_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blueprint_rules', function (Blueprint $table) {
            $table->dropColumn(['question_type', 'points_per_question']);
        });
    }
};

