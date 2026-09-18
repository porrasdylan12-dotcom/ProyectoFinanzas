<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->account = Account::factory()->create(['user_id' => $this->user->id]);
    $this->category = Category::factory()->create(['user_id' => $this->user->id, 'type' => 'gasto']);
    Sanctum::actingAs($this->user);
});

function datosTransaccionValidos(array $overrides = []): array
{
    return array_merge([
        'account_id' => null,
        'category_id' => null,
        'type' => 'gasto',
        'amount' => 15000,
        'description' => 'Compra de prueba',
        'transaction_date' => now()->format('Y-m-d'),
    ], $overrides);
}

test('lista transacciones del usuario autenticado con paginación', function () {
    Transaction::factory()->count(2)->create([
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
    ]);
    $otherUser = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $otherUser->id]);
    Transaction::factory()->create([
        'account_id' => $otherAccount->id,
        'category_id' => Category::factory()->create(['user_id' => $otherUser->id])->id,
    ]);

    $this->getJson('/api/transactions')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonStructure([
            'data' => [['id', 'cuenta_id', 'categoria_id', 'tipo', 'monto', 'fecha']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

test('lista transacciones de una cuenta específica (anidado)', function () {
    Transaction::factory()->create(['account_id' => $this->account->id, 'category_id' => $this->category->id]);

    $this->getJson("/api/accounts/{$this->account->id}/transactions")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('crea una transacción y actualiza el saldo de la cuenta', function () {
    $this->account->update(['balance' => 1000]);

    $response = $this->postJson('/api/transactions', datosTransaccionValidos([
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount' => 5000,
    ]));

    $response->assertStatus(201)
        ->assertJsonPath('data.monto', '5000.00')
        ->assertJsonPath('data.tipo', 'gasto')
        ->assertHeader('Location', route('api.transactions.show', $response->json('data.id')));

    expect($this->account->fresh()->balance)->toBe('-4000.00');
});

test('crea una transacción anidada a una cuenta', function () {
    $this->postJson("/api/accounts/{$this->account->id}/transactions", datosTransaccionValidos([
        'category_id' => $this->category->id,
        'account_id' => $this->account->id,
    ]))->assertStatus(201)
        ->assertJsonPath('data.tipo', 'gasto');
});

test('rechaza datos inválidos al crear transacción', function () {
    $this->postJson('/api/transactions', [
        'account_id' => $this->account->id,
        'type' => 'invalido',
    ])->assertStatus(422)
        ->assertJsonStructure(['message', 'code', 'errors']);
});

test('muestra y actualiza una transacción propia', function () {
    $transaction = Transaction::factory()->create([
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
    ]);

    $this->getJson("/api/transactions/{$transaction->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $transaction->id);

    $this->putJson("/api/transactions/{$transaction->id}", datosTransaccionValidos([
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'description' => 'Descripción editada',
    ]))->assertOk()
        ->assertJsonPath('data.descripcion', 'Descripción editada');
});

test('no permite acceder a transacciones de otro usuario (404)', function () {
    $otherUser = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $otherUser->id]);
    $transaction = Transaction::factory()->create([
        'account_id' => $otherAccount->id,
        'category_id' => Category::factory()->create(['user_id' => $otherUser->id, 'type' => 'gasto'])->id,
    ]);

    $this->getJson("/api/transactions/{$transaction->id}")
        ->assertStatus(404);
});

test('elimina una transacción y revierte su efecto sobre el saldo', function () {
    $this->account->update(['balance' => 8000]);

    $response = $this->postJson('/api/transactions', datosTransaccionValidos([
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount' => 2000,
    ]));

    $transactionId = $response->json('data.id');
    expect($this->account->fresh()->balance)->toBe('6000.00');

    $this->deleteJson("/api/transactions/{$transactionId}")
        ->assertStatus(204);

    expect(Transaction::find($transactionId))->toBeNull();
    expect($this->account->fresh()->balance)->toBe('8000.00');
});
