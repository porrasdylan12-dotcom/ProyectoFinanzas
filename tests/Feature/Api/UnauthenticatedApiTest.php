<?php

use App\Models\Account;
use App\Models\User;

test('las rutas protegidas devuelven 401 sin token', function (string $method, string $uri) {
    $this->{$method}($uri)
        ->assertStatus(401)
        ->assertJsonPath('code', 'NO_AUTENTICADO');
})->with([
    ['get', '/api/accounts'],
    ['get', '/api/categories'],
    ['get', '/api/budgets'],
    ['get', '/api/transactions'],
    ['get', '/api/groups'],
    ['get', '/api/shared-expenses'],
    ['get', '/api/group-debts'],
    ['get', '/api/user'],
    ['get', '/api/accounts/1'],
    ['get', '/api/budgets/1'],
    ['get', '/api/categories/1'],
    ['get', '/api/transactions/1'],
    ['get', '/api/groups/1'],
    ['get', '/api/shared-expenses/1'],
    ['get', '/api/group-debts/1'],
]);

test('el recurso inexistente devuelve 404 con formato JSON', function () {
    $user = User::factory()->create();
    $this->actingAs($user, 'sanctum');

    $this->getJson('/api/accounts/99999')
        ->assertStatus(404)
        ->assertJsonPath('code', 'RECURSO_NO_ENCONTRADO');
});

test('no existe una cuenta de otro usuario (404)', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $this->actingAs($user, 'sanctum');

    $account = Account::factory()->create(['user_id' => $other->id]);

    $this->getJson("/api/accounts/{$account->id}")
        ->assertStatus(404)
        ->assertJsonPath('code', 'RECURSO_NO_ENCONTRADO');

    $this->putJson("/api/accounts/{$account->id}", [
        'name' => 'Ajeno',
        'type' => 'ahorros',
        'balance' => 0,
    ])->assertStatus(404);
});

test('la consulta 500 no se filtra en respuestas JSON para rutas api', function () {
    $user = User::factory()->create();
    $this->actingAs($user, 'sanctum');

    // Una ruta inexistente del API debe devolver 404, no 500.
    $this->getJson('/api/no-existe')
        ->assertStatus(404);
});
