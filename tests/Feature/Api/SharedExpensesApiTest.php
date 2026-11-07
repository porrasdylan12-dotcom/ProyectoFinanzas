<?php

use App\Models\Group;
use App\Models\SharedExpenses;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->memberA = User::factory()->create();
    $this->memberB = User::factory()->create();

    $this->group = Group::factory()->create();
    $this->group->users()->attach($this->user->id, ['role' => 'admin', 'joined_at' => now()]);
    $this->group->users()->attach($this->memberA->id, ['role' => 'member', 'joined_at' => now()]);
    $this->group->users()->attach($this->memberB->id, ['role' => 'member', 'joined_at' => now()]);

    Sanctum::actingAs($this->user);
});

function datosGastoValidos(array $overrides = []): array
{
    return array_merge([
        'group_id' => null,
        'amount' => 30000,
        'description' => 'Cena de grupo',
        'date' => now()->format('Y-m-d'),
        'participants' => null,
    ], $overrides);
}

test('crea un gasto compartido y genera deudas automáticamente', function () {
    $response = $this->postJson('/api/shared-expenses', datosGastoValidos([
        'group_id' => $this->group->id,
        'participants' => [$this->user->id, $this->memberA->id, $this->memberB->id],
    ]));

    $response->assertStatus(201)
        ->assertJsonPath('data.monto', '30000.00')
        ->assertJsonCount(2, 'data.deudas')
        ->assertHeader('Location', route('api.shared-expenses.show', $response->json('data.id')));

    $expense = SharedExpenses::find($response->json('data.id'));
    expect($expense->debts()->count())->toBe(2);
    expect($expense->debts()->where('debtor_id', $this->memberA->id)->first()->total_amount)->toBe('10000.00');
});

test('crea un gasto anidado a un grupo', function () {
    $this->postJson("/api/groups/{$this->group->id}/shared-expenses", datosGastoValidos([
        'participants' => [$this->user->id, $this->memberA->id],
        'group_id' => $this->group->id,
    ]))->assertStatus(201)
        ->assertJsonPath('data.grupo_id', $this->group->id);
});

test('exige al menos dos participantes', function () {
    $this->postJson('/api/shared-expenses', datosGastoValidos([
        'group_id' => $this->group->id,
        'participants' => [$this->user->id],
    ]))->assertStatus(422)
        ->assertJsonValidationErrors('participants');
});

test('lista los gastos compartidos pagados por el usuario y todos los del grupo', function () {
    SharedExpenses::factory()->create([
        'group_id' => $this->group->id,
        'user_id' => $this->user->id,
        'participants' => [$this->user->id, $this->memberA->id],
    ]);
    SharedExpenses::factory()->create([
        'group_id' => $this->group->id,
        'user_id' => $this->memberA->id,
        'participants' => [$this->memberA->id, $this->memberB->id],
    ]);

    $this->getJson('/api/shared-expenses')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->getJson("/api/groups/{$this->group->id}/shared-expenses")
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('muestra y actualiza un gasto compartido propio', function () {
    $expense = SharedExpenses::factory()->create([
        'group_id' => $this->group->id,
        'user_id' => $this->user->id,
        'participants' => [$this->user->id, $this->memberA->id],
    ]);

    $this->getJson("/api/shared-expenses/{$expense->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $expense->id);

    $this->putJson("/api/shared-expenses/{$expense->id}", datosGastoValidos([
        'group_id' => $this->group->id,
        'participants' => [$this->user->id, $this->memberA->id],
        'description' => 'Cena actualizada',
    ]))->assertOk()
        ->assertJsonPath('data.descripcion', 'Cena actualizada');
});

test('no permite acceder a gastos ajenos (404)', function () {
    $other = User::factory()->create();
    $otherGroup = Group::factory()->create();
    $otherGroup->users()->attach($other->id, ['role' => 'admin', 'joined_at' => now()]);

    $expense = SharedExpenses::factory()->create([
        'group_id' => $otherGroup->id,
        'user_id' => $other->id,
        'participants' => [$other->id],
    ]);

    $this->getJson("/api/shared-expenses/{$expense->id}")
        ->assertStatus(404);
});

test('no permite actualizar un gasto compartido ajeno (404)', function () {
    $other = User::factory()->create();
    $otherGroup = Group::factory()->create();
    $otherGroup->users()->attach($other->id, ['role' => 'admin', 'joined_at' => now()]);

    $expense = SharedExpenses::factory()->create([
        'group_id' => $otherGroup->id,
        'user_id' => $other->id,
        'participants' => [$other->id],
        'description' => 'Gasto ajeno',
    ]);

    $this->putJson("/api/shared-expenses/{$expense->id}", datosGastoValidos([
        'group_id' => $otherGroup->id,
        'participants' => [$other->id, $this->user->id],
        'description' => 'Gasto robado',
    ]))->assertStatus(404);

    expect(SharedExpenses::find($expense->id)->description)->toBe('Gasto ajeno');
});

test('elimina un gasto compartido (204)', function () {
    $expense = SharedExpenses::factory()->create([
        'group_id' => $this->group->id,
        'user_id' => $this->user->id,
        'participants' => [$this->user->id, $this->memberA->id],
    ]);

    $this->deleteJson("/api/shared-expenses/{$expense->id}")
        ->assertStatus(204);

    expect(SharedExpenses::find($expense->id))->toBeNull();
});
