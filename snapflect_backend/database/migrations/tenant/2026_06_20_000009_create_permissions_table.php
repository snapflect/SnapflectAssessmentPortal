<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('permission_code', 100)->unique();
            $table->string('module', 100);
            $table->string('description', 255)->nullable();
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            



        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};

