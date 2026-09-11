<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
   protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement([
                'Cuenta Principal',
                'Cuenta de Ahorros',
                'Cuenta Universitaria',
                'Efectivo',
                'Cuenta Corriente',
            ]),
            'type' => fake()->randomElement([
                'ahorros',
                'corriente',
                'efectivo',
            ]),
            'balance' => fake()->randomFloat(2, 10000, 500000),
        ];
    }
}