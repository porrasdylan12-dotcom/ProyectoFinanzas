<?php

namespace Database\Factories;

use App\Models\GroupDebt;
use App\Models\SharedExpenses;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GroupDebt>
 */
class GroupDebtFactory extends Factory
{
    protected $model = GroupDebt::class;

    public function definition(): array
    {
        return [
            'shared_expense_id' => SharedExpenses::factory(),
            'debtor_id' => User::factory(),
            'creditor_id' => User::factory(),
            'name' => fake()->randomElement([
                'Deuda de comida',
                'Deuda de transporte',
                'Deuda de servicios',
                'Deuda de actividad grupal',
                'Deuda de compra compartida',
            ]),
            'description' => fake()->sentence(6),
            'total_amount' => fake()->randomFloat(2, 5000, 100000),
            'status' => fake()->randomElement([
                'pending',
                'paid',
            ]),
        ];
    }
}