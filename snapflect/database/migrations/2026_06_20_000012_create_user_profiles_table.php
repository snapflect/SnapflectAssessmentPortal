<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('profile_photo_url', 500)->nullable();
            $table->string('company', 255)->nullable();
            $table->string('designation', 255)->nullable();
            $table->decimal('years_of_experience', 5, 2)->nullable();
            $table->text('technology_expertise')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->text('bio')->nullable();
            $table->decimal('profile_completion_percentage', 5, 2)->default(0);
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->foreign('created_by')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('modified_by')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('deleted_by')->references('id')->on('users')->restrictOnDelete();
            
            $table->index('country');
            $table->index('state');
            $table->index('city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
