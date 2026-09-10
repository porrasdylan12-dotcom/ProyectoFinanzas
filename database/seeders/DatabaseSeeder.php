<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Estudiante Prueba',
            'email' => 'estudiante@test.com',
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $groupId = DB::table('groups')->insertGetId([
            'name' => 'Proyecto Laboratorio 3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_group')->insert([
            'user_id' => $userId,
            'group_id' => $groupId,
            'role' => 'admin',
            'joined_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}