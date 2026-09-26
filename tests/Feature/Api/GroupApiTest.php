<?php

use App\Models\Group;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

test('lista solo los grupos a los que pertenece el usuario', function () {
    $member = User::factory()->create();

    $mine = Group::factory()->create();
    $mine->users()->attach($this->user->id, ['role' => 'admin', 'joined_at' => now()]);

    $other = Group::factory()->create();
    $other->users()->attach($member->id, ['role' => 'admin', 'joined_at' => now()]);

    $this->getJson('/api/groups')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $mine->id)
        ->assertJsonPath('data.0.miembros.0.rol', 'admin');
});

test('crea un grupo y asocia al creador como admin', function () {
    $response = $this->postJson('/api/groups', ['name' => 'Apartamento 301']);

    $response->assertStatus(201)
        ->assertJsonPath('data.nombre', 'Apartamento 301')
        ->assertHeader('Location', route('api.groups.show', $response->json('data.id')));

    $group = Group::find($response->json('data.id'));
    expect($group->users()->where('user_id', $this->user->id)->value('role'))->toBe('admin');
});

test('rechaza un grupo sin nombre o duplicado', function () {
    Group::factory()->create(['name' => 'Viaje a la playa']);

    $this->postJson('/api/groups', ['name' => ''])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');

    $this->postJson('/api/groups', ['name' => 'Viaje a la playa'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('muestra y actualiza un grupo propio', function () {
    $group = Group::factory()->create();
    $group->users()->attach($this->user->id, ['role' => 'admin', 'joined_at' => now()]);

    $this->getJson("/api/groups/{$group->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $group->id);

    $this->putJson("/api/groups/{$group->id}", ['name' => 'Grupo renombrado'])
        ->assertOk()
        ->assertJsonPath('data.nombre', 'Grupo renombrado');
});

test('no permite ver grupos ajenos (404)', function () {
    $group = Group::factory()->create();
    $group->users()->attach(User::factory()->create()->id, ['role' => 'admin', 'joined_at' => now()]);

    $this->getJson("/api/groups/{$group->id}")
        ->assertStatus(404);
});

test('no permite actualizar un grupo ajeno (404)', function () {
    $group = Group::factory()->create(['name' => 'Grupo ajeno']);
    $group->users()->attach(User::factory()->create()->id, ['role' => 'admin', 'joined_at' => now()]);

    $this->putJson("/api/groups/{$group->id}", ['name' => 'Grupo robado'])
        ->assertStatus(404);

    expect(Group::find($group->id)->name)->toBe('Grupo ajeno');
});

test('solo el admin puede eliminar el grupo (403 y 204)', function () {
    $member = User::factory()->create();

    $group = Group::factory()->create();
    $group->users()->attach($this->user->id, ['role' => 'admin', 'joined_at' => now()]);
    $group->users()->attach($member->id, ['role' => 'member', 'joined_at' => now()]);

    Sanctum::actingAs($member);
    $this->deleteJson("/api/groups/{$group->id}")
        ->assertStatus(403)
        ->assertJsonPath('code', 'ACCESO_DENEGADO');

    Sanctum::actingAs($this->user);
    $this->deleteJson("/api/groups/{$group->id}")
        ->assertStatus(204);

    expect(Group::find($group->id))->toBeNull();
});
