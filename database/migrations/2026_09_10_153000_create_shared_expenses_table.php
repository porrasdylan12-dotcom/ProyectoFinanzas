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
        Schema::create('shared_expenses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('group_id')->constrained()->cascadeOnDelete();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Quien pagó
        $table->decimal('amount', 12, 2);
        $table->text('description')->nullable();
        $table->date('date')->index();
        $table->json('participants')->nullable(); // Guardamos el array de participantes
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_expenses');
    }
};
