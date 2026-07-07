<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('tenant_subscription_id')->nullable();
            $table->string('invoice_number')->unique();
            $table->decimal('amount_due', 10, 2)->default(0.00); // INR
            $table->decimal('amount_paid', 10, 2)->default(0.00); // INR
            $table->enum('status', ['DRAFT', 'PAID', 'OVERDUE'])->default('DRAFT');
            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_date')->nullable();
            $table->string('payment_reference')->nullable();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('tenant_subscription_id')->references('id')->on('tenant_subscriptions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
