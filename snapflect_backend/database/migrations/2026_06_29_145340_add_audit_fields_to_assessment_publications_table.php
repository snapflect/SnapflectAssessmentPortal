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
            $table->unsignedBigInteger('modified_by')->nullable()->after('created_date');
            $table->timestamp('modified_date')->nullable()->after('modified_by');
            $table->boolean('is_deleted')->default(false)->after('modified_date');
            $table->unsignedBigInteger('deleted_by')->nullable()->after('is_deleted');
            $table->timestamp('deleted_date')->nullable()->after('deleted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_publications', function (Blueprint $table) {
            $table->dropColumn([
                'modified_by',
                'modified_date',
                'is_deleted',
                'deleted_by',
                'deleted_date'
            ]);
        });
    }
};
