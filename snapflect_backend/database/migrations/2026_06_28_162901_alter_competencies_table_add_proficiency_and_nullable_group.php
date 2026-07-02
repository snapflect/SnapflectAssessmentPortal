<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competencies', function (Blueprint $table) {
            $table->string('proficiency_level', 50)->nullable()->after('competency_name');
            $table->unsignedBigInteger('competency_group_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('competencies', function (Blueprint $table) {
            $table->dropColumn('proficiency_level');
            $table->unsignedBigInteger('competency_group_id')->nullable(false)->change();
        });
    }
};
