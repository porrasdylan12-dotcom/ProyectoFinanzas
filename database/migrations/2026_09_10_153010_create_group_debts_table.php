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
        Schema::create('group_debts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('shared_expense_id')->constrained('shared_expenses')->cascadeOnDelete();
        $table->foreignId('debtor_id')->constrained('users')->cascadeOnDelete(); // El que debe
        $table->foreignId('creditor_id')->constrained('users')->cascadeOnDelete(); // Al que le deben
        $table->string('name', 100)->nullable();
        $table->text('description')->nullable();
        $table->decimal('total_amount', 12, 2);
        $table->string('status', 20)->default('pending')->index();
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_debts');
    }
};
