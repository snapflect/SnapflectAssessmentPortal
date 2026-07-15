<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->constrained('organizations')->restrictOnDelete();
            $table->foreignId('business_unit_id')->nullable()->constrained('business_units')->restrictOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->restrictOnDelete();
            
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('status', 50)->default('ACTIVE');
            $table->dateTime('last_login_at')->nullable();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->index(['organization_id', 'email']);
            $table->index('email');
            $table->index('status');
            $table->index('is_deleted');
        });
        

    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
