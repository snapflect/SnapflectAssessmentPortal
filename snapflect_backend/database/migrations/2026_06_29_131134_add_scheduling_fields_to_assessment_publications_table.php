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
        Schema::table('assessment_publications', function (Blueprint $table) {
            $table->string('publication_code', 50)->unique()->nullable()->after('uuid');
            $table->string('title', 255)->nullable()->after('publication_code');
            $table->string('status', 50)->default('SCHEDULED')->after('publication_notes');
            $table->dateTime('start_date')->nullable()->after('status');
            $table->dateTime('end_date')->nullable()->after('start_date');
            $table->integer('max_attempts')->default(1)->after('end_date');
            $table->boolean('is_proctored')->default(false)->after('max_attempts');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_publications', function (Blueprint $table) {
            $table->dropColumn([
                'publication_code',
                'title',
                'status',
                'start_date',
                'end_date',
                'max_attempts',
                'is_proctored'
            ]);
        });
    }
};
