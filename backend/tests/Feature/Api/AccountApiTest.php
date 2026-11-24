<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('lista las cuentas del usuario autenticado con paginación', function () {
    Account::factory()->count(3)->create(['user_id' => $this->user->id]);
    Account::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->getJson('/api/accounts')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('meta.total', 3)
        ->assertJsonStructure([
            'data' => [['id', 'user_id', 'nombre', 'saldo', 'tipo']],
            'links' => ['first', 'last', 'prev', 'next'],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

test('crea una cuenta y devuelve 201 con Location', function () {
    $response = $this->postJson('/api/accounts', [
        'name' => 'Mi cuenta ahorro',
        'type' => 'ahorros',
        'balance' => 2500.50,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.nombre', 'Mi cuenta ahorro')
        ->assertJsonPath('data.tipo', 'ahorros')
        ->assertHeader('Location', route('api.accounts.show', $response->json('data.id')));

    expect(Account::where('user_id', $this->user->id)->count())->toBe(1);
});

test('valida los datos al crear una cuenta', function () {
    $this->postJson('/api/accounts', [
        'name' => 'A',
        'type' => 'desconocido',
        'balance' => -5,
    ])->assertStatus(422)
        ->assertJsonStructure(['message', 'code', 'errors']);
});

test('muestra una cuenta del usuario autenticado', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);

    $this->getJson("/api/accounts/{$account->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $account->id)
        ->assertJsonPath('data.nombre', $account->name);
});

test('no permite ver cuentas de otro usuario (404)', function () {
    $other = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $other->id]);

    $this->getJson("/api/accounts/{$account->id}")
        ->assertStatus(404)
        ->assertJsonPath('code', 'RECURSO_NO_ENCONTRADO');
});

test('actualiza una cuenta del usuario', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);

    $this->putJson("/api/accounts/{$account->id}", [
        'name' => 'Cuenta renovada',
        'type' => 'corriente',
        'balance' => $account->balance,
    ])->assertOk()
        ->assertJsonPath('data.nombre', 'Cuenta renovada')
        ->assertJsonPath('data.tipo', 'corriente');
});

test('no permite crear una cuenta de efectivo duplicada (409)', function () {
    Account::factory()->create([
        'user_id' => $this->user->id,
        'type' => 'efectivo',
        'balance' => 500,
    ]);

    $this->postJson('/api/accounts', [
        'name' => 'Segundo efectivo',
        'type' => 'efectivo',
        'balance' => 100,
    ])->assertStatus(409)
        ->assertJsonPath('code', 'CUENTA_EFECTIVO_DUPLICADA');
});

test('no permite eliminar cuenta con transacciones (409)', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);
    Transaction::factory()->create(['account_id' => $account->id]);

    $this->deleteJson("/api/accounts/{$account->id}")
        ->assertStatus(409)
        ->assertJsonPath('code', 'CUENTA_CON_DEPENDENCIAS');
});

test('elimina una cuenta sin transacciones (204)', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);

    $this->deleteJson("/api/accounts/{$account->id}")
        ->assertStatus(204);

    expect(Account::find($account->id))->toBeNull();
});

test('restringe la paginación al máximo de 50', function () {
    Account::factory()->count(3)->create(['user_id' => $this->user->id]);

    $this->getJson('/api/accounts?per_page=100')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 50);
});
