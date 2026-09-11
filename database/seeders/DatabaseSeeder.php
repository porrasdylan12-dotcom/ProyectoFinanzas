<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        $groupId = DB::table('groups')->insertGetId([
            'name' => 'Proyecto Laboratorio 3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        for ($i = 0; $i < 20; $i++) {

            $userId = DB::table('users')->insertGetId([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_group')->insert([
                'user_id' => $userId,
                'group_id' => $groupId,
                'role' => ($i === 0) ? 'admin' : 'member', 
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}