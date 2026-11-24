<?php

use App\Models\Group;
use App\Models\GroupDebt;
use App\Models\SharedExpenses;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->payer = User::factory()->create();
    $this->debtor = User::factory()->create();

    $this->group = Group::factory()->create();
    $this->group->users()->attach($this->payer->id, ['role' => 'admin', 'joined_at' => now()]);
    $this->group->users()->attach($this->debtor->id, ['role' => 'member', 'joined_at' => now()]);

    $this->expense = SharedExpenses::factory()->create([
        'group_id' => $this->group->id,
        'user_id' => $this->payer->id,
        'participants' => [$this->payer->id, $this->debtor->id],
    ]);

    Sanctum::actingAs($this->debtor);
});

function datosDeudaValidos(array $overrides = []): array
{
    return array_merge([
        'shared_expense_id' => null,
        'debtor_id' => null,
        'creditor_id' => null,
        'total_amount' => 15000,
        'status' => 'pending',
    ], $overrides);
}

test('crea una deuda y devuelve 201 con Location', function () {
    $response = $this->postJson('/api/group-debts', datosDeudaValidos([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
    ]));

    $response->assertStatus(201)
        ->assertJsonPath('data.monto_total', '15000.00')
        ->assertJsonPath('data.estado', 'pending')
        ->assertHeader('Location', route('api.group-debts.show', $response->json('data.id')));

    expect(GroupDebt::where('debtor_id', $this->debtor->id)->count())->toBe(1);
});

test('rechaza una deuda de un usuario consigo mismo (422)', function () {
    $this->postJson('/api/group-debts', datosDeudaValidos([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->debtor->id,
    ]))->assertStatus(422)
        ->assertJsonPath('code', 'DEUDA_ORIGEN_INVALIDO');
});

test('lista deudas del usuario (deudor o acreedor) y por gasto', function () {
    GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
    ]);

    $this->getJson('/api/group-debts')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->getJson("/api/shared-expenses/{$this->expense->id}/group-debts")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('filtra deudas por estado', function () {
    GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'paid',
    ]);

    $this->getJson('/api/group-debts?status=pending')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('muestra una deuda propia', function () {
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'pending',
    ]);

    $this->getJson("/api/group-debts/{$debt->id}")
        ->assertOk()
        ->assertJsonPath('data.estado', 'pending');
});

test('no permite acceder a deudas ajenas (404)', function () {
    $outsider = User::factory()->create();
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $outsider->id,
        'creditor_id' => $this->payer->id,
    ]);

    $this->getJson("/api/group-debts/{$debt->id}")
        ->assertStatus(404);
});

test('no permite actualizar una deuda ajena (404)', function () {
    $outsider = User::factory()->create();
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $outsider->id,
        'creditor_id' => $this->payer->id,
        'status' => 'pending',
    ]);

    $this->putJson("/api/group-debts/{$debt->id}", datosDeudaValidos([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $outsider->id,
        'creditor_id' => $this->payer->id,
        'status' => 'paid',
    ]))->assertStatus(404);

    expect(GroupDebt::find($debt->id)->status)->toBe('pending');
});

test('permite marcar una deuda como pagada', function () {
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'pending',
    ]);

    $this->putJson("/api/group-debts/{$debt->id}", datosDeudaValidos([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'paid',
    ]))->assertOk()
        ->assertJsonPath('data.estado', 'paid');
});

test('no permite revertir una deuda pagada (409)', function () {
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'paid',
    ]);

    $this->putJson("/api/group-debts/{$debt->id}", datosDeudaValidos([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'pending',
    ]))->assertStatus(409)
        ->assertJsonPath('code', 'DEUDA_YA_PAGADA');
});

test('no permite eliminar una deuda pagada (409)', function () {
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'paid',
    ]);

    $this->deleteJson("/api/group-debts/{$debt->id}")
        ->assertStatus(409)
        ->assertJsonPath('code', 'DEUDA_YA_PAGADA');
});

test('elimina una deuda pendiente (204)', function () {
    $debt = GroupDebt::factory()->create([
        'shared_expense_id' => $this->expense->id,
        'debtor_id' => $this->debtor->id,
        'creditor_id' => $this->payer->id,
        'status' => 'pending',
    ]);

    $this->deleteJson("/api/group-debts/{$debt->id}")
        ->assertStatus(204);

    expect(GroupDebt::find($debt->id))->toBeNull();
});
