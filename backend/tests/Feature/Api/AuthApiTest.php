<?php

use App\Models\User;

test('el endpoint de token rechaza credenciales incorrectas (401)', function () {
    User::factory()->create([
        'email' => 'maria@ejemplo.com',
        'password' => bcrypt('secret-password'),
    ]);

    $this->postJson('/api/sanctum/token', [
        'email' => 'maria@ejemplo.com',
        'password' => 'password-incorrecto',
        'device_name' => 'Postman',
    ])->assertStatus(401)
        ->assertJsonPath('code', 'CREDENCIALES_INVALIDAS');
});

test('valida los campos del formulario de token (422)', function () {
    $this->postJson('/api/sanctum/token', [
        'email' => 'no-es-email',
    ])->assertStatus(422)
        ->assertJsonStructure(['message', 'code', 'errors']);
});

test('emite un token Sanctum con credenciales válidas', function () {
    User::factory()->create([
        'email' => 'maria@ejemplo.com',
        'password' => bcrypt('secret-password'),
    ]);

    $this->postJson('/api/sanctum/token', [
        'email' => 'maria@ejemplo.com',
        'password' => 'secret-password',
        'device_name' => 'Postman',
    ])->assertOk()
        ->assertJsonStructure(['token']);
});

test('devuelve los datos del usuario autenticado', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});
