<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('lista categorías del usuario autenticado con paginación', function () {
    Category::factory()->count(2)->create(['user_id' => $this->user->id]);
    Category::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->getJson('/api/categories')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonStructure([
            'data' => [['id', 'user_id', 'nombre', 'tipo']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

test('filtra categorías por tipo', function () {
    Category::factory()->create(['user_id' => $this->user->id, 'type' => 'ingreso']);
    Category::factory()->create(['user_id' => $this->user->id, 'type' => 'gasto']);

    $this->getJson('/api/categories?type=ingreso')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.tipo', 'ingreso');
});

test('crea una categoría y devuelve 201 con Location', function () {
    $response = $this->postJson('/api/categories', [
        'name' => 'Gimnasio',
        'type' => 'gasto',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.nombre', 'Gimnasio')
        ->assertHeader('Location', route('api.categories.show', $response->json('data.id')));

    expect(Category::where('user_id', $this->user->id)->count())->toBe(1);
});

test('rechaza datos inválidos al crear categoría', function () {
    $this->postJson('/api/categories', ['name' => '', 'type' => 'raro'])
        ->assertStatus(422)
        ->assertJsonStructure(['message', 'code', 'errors']);
});

test('rechaza nombre de categoría duplicado para el mismo usuario', function () {
    Category::factory()->create(['user_id' => $this->user->id, 'name' => 'Gimnasio']);

    $this->postJson('/api/categories', ['name' => 'Gimnasio', 'type' => 'gasto'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('muestra y actualiza una categoría propia', function () {
    $category = Category::factory()->create(['user_id' => $this->user->id, 'type' => 'gasto']);

    $this->getJson("/api/categories/{$category->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $category->id);

    $this->putJson("/api/categories/{$category->id}", [
        'name' => 'Salud y bienestar',
        'type' => 'gasto',
    ])->assertOk()
        ->assertJsonPath('data.nombre', 'Salud y bienestar');
});

test('no permite acceder a categorías de otro usuario (404)', function () {
    $category = Category::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->getJson("/api/categories/{$category->id}")
        ->assertStatus(404);
});

test('no permite eliminar categoría con transacciones (409)', function () {
    $category = Category::factory()->create(['user_id' => $this->user->id]);
    $account = Account::factory()->create(['user_id' => $this->user->id]);
    Transaction::factory()->create(['account_id' => $account->id, 'category_id' => $category->id]);

    $this->deleteJson("/api/categories/{$category->id}")
        ->assertStatus(409)
        ->assertJsonPath('code', 'CATEGORIA_CON_TRANSACCIONES');
});

test('elimina una categoría sin transacciones (204)', function () {
    $category = Category::factory()->create(['user_id' => $this->user->id]);

    $this->deleteJson("/api/categories/{$category->id}")
        ->assertStatus(204);

    expect(Category::find($category->id))->toBeNull();
});
