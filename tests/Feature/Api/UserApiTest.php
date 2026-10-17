<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

test('devuelve el id, el nombre y el correo del usuario autenticado', function () {
    $user = User::factory()->create([
        'name' => 'Ana Pérez',
        'email' => 'ana@ejemplo.com',
    ]);

    $this->actingAs($user, 'sanctum')->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.nombre', 'Ana Pérez')
        ->assertJsonPath('data.email', 'ana@ejemplo.com');
});

test('actualiza el nombre y el correo del usuario autenticado', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->patchJson('/api/user', [
        'name' => 'Nombre Nuevo',
        'email' => 'nuevo@ejemplo.com',
    ])->assertOk()
        ->assertJsonPath('data.nombre', 'Nombre Nuevo')
        ->assertJsonPath('data.email', 'nuevo@ejemplo.com');

    expect($user->refresh()->email)->toBe('nuevo@ejemplo.com');
});

test('rechaza un correo ya registrado al actualizar el perfil (422)', function () {
    User::factory()->create(['email' => 'ocupado@ejemplo.com']);
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->patchJson('/api/user', [
        'name' => 'Nombre Nuevo',
        'email' => 'ocupado@ejemplo.com',
    ])->assertStatus(422)
        ->assertJsonPath('code', 'DATOS_INVALIDOS')
        ->assertJsonValidationErrors('email');
});

test('cambia la contraseña con la contraseña actual correcta', function () {
    $user = User::factory()->create(['password' => bcrypt('contrasena-actual')]);

    $this->actingAs($user, 'sanctum')->putJson('/api/user/password', [
        'current_password' => 'contrasena-actual',
        'password' => 'nueva-contrasena-123',
        'password_confirmation' => 'nueva-contrasena-123',
    ])->assertOk();

    expect(Hash::check('nueva-contrasena-123', $user->refresh()->password))->toBeTrue();
});

test('rechaza la contraseña actual incorrecta (422)', function () {
    $user = User::factory()->create(['password' => bcrypt('contrasena-actual')]);

    $this->actingAs($user, 'sanctum')->putJson('/api/user/password', [
        'current_password' => 'incorrecta',
        'password' => 'nueva-contrasena-123',
        'password_confirmation' => 'nueva-contrasena-123',
    ])->assertStatus(422)
        ->assertJsonPath('code', 'DATOS_INVALIDOS')
        ->assertJsonValidationErrors('current_password');
});

test('rechaza una nueva contraseña sin confirmar (422)', function () {
    $user = User::factory()->create(['password' => bcrypt('contrasena-actual')]);

    $this->actingAs($user, 'sanctum')->putJson('/api/user/password', [
        'current_password' => 'contrasena-actual',
        'password' => 'nueva-contrasena-123',
        'password_confirmation' => 'otra-distinta',
    ])->assertStatus(422)
        ->assertJsonValidationErrors('password');
});

test('envía el enlace de recuperación sin revelar si el correo existe', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'existe@ejemplo.com']);

    $this->postJson('/api/forgot-password', ['email' => 'existe@ejemplo.com'])
        ->assertOk();

    Notification::assertSentTo($user, ResetPassword::class);

    $this->postJson('/api/forgot-password', ['email' => 'no-existe@ejemplo.com'])
        ->assertOk();
});

test('valida el correo al solicitar la recuperación (422)', function () {
    $this->postJson('/api/forgot-password', ['email' => 'no-es-email'])
        ->assertStatus(422)
        ->assertJsonPath('code', 'DATOS_INVALIDOS')
        ->assertJsonValidationErrors('email');
});
