<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competency_groups', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('organization_id');
            $table->string('group_code', 50);
            $table->string('group_name', 255);
            $table->text('description')->nullable();
            $table->string('status', 30)->default('ACTIVE');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamp('modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(0);
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('deleted_date')->nullable();


            $table->unique(['organization_id', 'group_code'], 'uq_competency_group_code');
            $table->index('organization_id', 'idx_competency_group_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competency_groups');
    }
};

