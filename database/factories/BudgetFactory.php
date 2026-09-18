<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Budget>
 */
class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->randomElement([
                'Presupuesto de alimentación',
                'Presupuesto de transporte',
                'Presupuesto universitario',
                'Presupuesto de entretenimiento',
                'Presupuesto de servicios',
            ]),
            'maxAmount' => fake()->randomFloat(2, 50000, 300000),
            'month' => fake()->numberBetween(1, 12),
            'year' => fake()->numberBetween(2026, 2027),
        ];
    }
}
