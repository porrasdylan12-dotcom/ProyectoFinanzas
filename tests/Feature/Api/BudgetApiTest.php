<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->category = Category::factory()->create(['user_id' => $this->user->id, 'type' => 'gasto']);
    Sanctum::actingAs($this->user);
});

function datosPresupuestoValidos(array $overrides = []): array
{
    return array_merge([
        'category_id' => null,
        'name' => 'Presupuesto de prueba',
        'maxAmount' => 120000,
        'month' => (int) now()->format('m'),
        'year' => (int) now()->format('Y'),
    ], $overrides);
}

test('lista presupuestos del usuario autenticado con paginación', function () {
    Budget::factory()->count(2)->create(['user_id' => $this->user->id, 'category_id' => $this->category->id]);
    Budget::factory()->create([
        'user_id' => User::factory()->create()->id,
        'category_id' => Category::factory()->create(['type' => 'gasto'])->id,
    ]);

    $this->getJson('/api/budgets')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonStructure([
            'data' => [['id', 'user_id', 'categoria_id', 'nombre', 'monto_maximo', 'mes', 'año', 'creada', 'actualizada']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

test('crea un presupuesto y devuelve 201 con Location', function () {
    $response = $this->postJson('/api/budgets', datosPresupuestoValidos([
        'category_id' => $this->category->id,
    ]));

    $response->assertStatus(201)
        ->assertJsonPath('data.nombre', 'Presupuesto de prueba')
        ->assertJsonPath('data.categoria_id', $this->category->id)
        ->assertHeader('Location', route('api.budgets.show', $response->json('data.id')));

    expect(Budget::where('user_id', $this->user->id)->count())->toBe(1);
});

test('rechaza un presupuesto retroactivo (422)', function () {
    $this->postJson('/api/budgets', datosPresupuestoValidos([
        'category_id' => $this->category->id,
        'year' => (int) now()->subYears(2)->format('Y'),
    ]))->assertStatus(422)
        ->assertJsonPath('code', 'PRESUPUESTO_RETROACTIVO');
});

test('aplica descuento del 10 % a montos mayores a 500.000', function () {
    $this->postJson('/api/budgets', datosPresupuestoValidos([
        'category_id' => $this->category->id,
        'maxAmount' => 600000,
    ]))->assertStatus(201)
        ->assertJsonPath('data.monto_maximo', '540000.00');
});

test('rechaza datos inválidos al crear presupuesto', function () {
    $this->postJson('/api/budgets', [
        'name' => 'X',
        'maxAmount' => 0,
    ])->assertStatus(422)
        ->assertJsonStructure(['message', 'code', 'errors']);
});

test('muestra y actualiza un presupuesto propio', function () {
    $budget = Budget::factory()->create(['user_id' => $this->user->id, 'category_id' => $this->category->id]);

    $this->getJson("/api/budgets/{$budget->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $budget->id);

    $this->putJson("/api/budgets/{$budget->id}", datosPresupuestoValidos([
        'category_id' => $this->category->id,
        'name' => 'Presupuesto actualizado',
    ]))->assertOk()
        ->assertJsonPath('data.nombre', 'Presupuesto actualizado');
});

test('no permite acceder a presupuestos de otro usuario (404)', function () {
    $other = User::factory()->create();
    $budget = Budget::factory()->create([
        'user_id' => $other->id,
        'category_id' => Category::factory()->create(['user_id' => $other->id, 'type' => 'gasto'])->id,
    ]);

    $this->getJson("/api/budgets/{$budget->id}")
        ->assertStatus(404);
});

test('no permite actualizar un presupuesto de otro usuario (404)', function () {
    $other = User::factory()->create();
    $budget = Budget::factory()->create([
        'user_id' => $other->id,
        'category_id' => Category::factory()->create(['user_id' => $other->id, 'type' => 'gasto'])->id,
        'name' => 'Presupuesto ajeno',
    ]);

    $this->putJson("/api/budgets/{$budget->id}", datosPresupuestoValidos([
        'category_id' => $this->category->id,
        'name' => 'Presupuesto robado',
    ]))->assertStatus(404);

    expect(Budget::find($budget->id)->name)->toBe('Presupuesto ajeno');
});

test('elimina un presupuesto propio (204)', function () {
    $budget = Budget::factory()->create(['user_id' => $this->user->id, 'category_id' => $this->category->id]);

    $this->deleteJson("/api/budgets/{$budget->id}")
        ->assertStatus(204);

    expect(Budget::find($budget->id))->toBeNull();
});
