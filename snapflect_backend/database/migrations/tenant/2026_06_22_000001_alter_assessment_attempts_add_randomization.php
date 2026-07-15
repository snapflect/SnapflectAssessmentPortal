<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessment_attempts', function (Blueprint $table) {
            $table->string('randomization_seed', 64)->nullable()->after('status');
            $table->json('question_order_json')->nullable()->after('randomization_seed');
            $table->json('option_order_json')->nullable()->after('question_order_json');
        });
    }

    public function down(): void
    {
        Schema::table('assessment_attempts', function (Blueprint $table) {
            $table->dropColumn(['randomization_seed', 'question_order_json', 'option_order_json']);
        });
    }
};

