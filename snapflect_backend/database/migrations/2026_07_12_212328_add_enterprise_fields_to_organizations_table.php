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
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('tenant_type', 50)->default('enterprise');
            $table->string('phone_number', 50)->nullable();
            $table->string('it_escalation_email', 255)->nullable();
            $table->string('plan_code', 50)->nullable();
            $table->string('payment_reference', 255)->nullable();
            $table->string('primary_color', 20)->nullable();
            $table->string('theme_mode', 20)->default('system');
            $table->boolean('enforce_mfa')->default(false);
            $table->boolean('enable_sso')->default(false);
            $table->string('session_timeout', 20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'tenant_type',
                'phone_number',
                'it_escalation_email',
                'plan_code',
                'payment_reference',
                'primary_color',
                'theme_mode',
                'enforce_mfa',
                'enable_sso',
                'session_timeout'
            ]);
        });
    }
};
