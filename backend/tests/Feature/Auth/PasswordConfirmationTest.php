<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('muestra la pantalla de confirmación de contraseña', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.confirm'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/confirm-password'),
    );
});

test('exige autenticación para confirmar la contraseña', function () {
    $response = $this->get(route('password.confirm'));

    $response->assertRedirect(route('login'));
});
