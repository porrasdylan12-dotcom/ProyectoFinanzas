<?php

use App\Models\User;

test('redirige a los visitantes al inicio de sesión', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('permite que una persona autenticada vea el panel', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});
