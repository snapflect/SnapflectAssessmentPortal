<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->nullable()->index();
            $table->string('role_code', 50);
            $table->string('role_name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_system_role')->default(false);
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->unique(['organization_id', 'role_code']);
            $table->index(['organization_id', 'role_code']);
            



        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};

