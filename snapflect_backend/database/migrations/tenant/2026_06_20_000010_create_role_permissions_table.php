<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('role_id')->constrained('roles')->restrictOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->restrictOnDelete();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            
            $table->unique(['role_id', 'permission_id']);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};

