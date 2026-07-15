<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('organization_drafts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('entity_type', 50)->index(); // 'organization'
            $table->string('entity_id', 50)->index(); // uuid or temporary ID
            $table->json('payload'); // The draft JSON
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_drafts');
    }
};
