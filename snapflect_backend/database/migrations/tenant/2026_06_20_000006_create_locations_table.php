<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organization_id')->index();
            $table->string('location_code', 50);
            $table->string('location_name', 255);
            $table->string('address', 500)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('status', 50)->default('ACTIVE');
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->dateTime('deleted_date')->nullable();
            
            $table->unique(['organization_id', 'location_code']);
            $table->index('status');
            $table->index('is_deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};

