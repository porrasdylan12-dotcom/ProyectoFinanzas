<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\SharedExpenses;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SharedExpenses>
 */
class SharedExpensesFactory extends Factory
{
    protected $model = SharedExpenses::class;

    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'user_id' => User::factory(),
            'amount' => fake()->randomFloat(2, 10000, 300000),
            'description' => fake()->randomElement([
                'Compra de alimentos',
                'Pago de servicios',
                'Cena grupal',
                'Transporte',
                'Compra para el apartamento',
                'Actividad grupal',
            ]),
            'date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'participants' => [],
        ];
    }
}
