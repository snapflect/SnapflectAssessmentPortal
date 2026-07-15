<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->index();
            $table->foreignId('role_id')->constrained('roles')->restrictOnDelete();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            
            $table->unique(['user_id', 'role_id']);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};

