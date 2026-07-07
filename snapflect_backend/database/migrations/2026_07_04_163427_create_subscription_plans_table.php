<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('plan_code')->unique();
            $table->string('plan_name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0.00); // INR
            $table->enum('billing_interval', ['DAYS', 'MONTHS', 'YEARS'])->default('MONTHS');
            $table->integer('interval_count')->default(1);
            $table->integer('included_assessments')->default(0); // 0 means unlimited or strict limit depending on business logic
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
