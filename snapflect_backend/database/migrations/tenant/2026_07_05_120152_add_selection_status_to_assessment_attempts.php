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
        Schema::table('assessment_attempts', function (Blueprint $table) {
            $table->string('selection_status', 50)->default('PENDING')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_attempts', function (Blueprint $table) {
            $table->dropColumn('selection_status');
        });
    }
};

