<?php

namespace Database\Factories;

use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Group>
 */
class GroupFactory extends Factory
{
   protected $model = Group::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Apartamento',
                'Viaje de fin de semana',
                'Proyecto universitario',
                'Grupo de amigos',
                'Gastos del hogar',
                'Viaje familiar',
            ]),
        ];
    }
}