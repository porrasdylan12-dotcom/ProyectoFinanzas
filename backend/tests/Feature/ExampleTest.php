<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('muestra el inicio de sesión a visitantes en la página inicial', function () {
    $response = $this->followingRedirects()->get(route('home'));

    $response->assertSee('Iniciar sesión');
});

test('muestra la bienvenida a usuarios autenticados en la página inicial', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome'),
    );
});
