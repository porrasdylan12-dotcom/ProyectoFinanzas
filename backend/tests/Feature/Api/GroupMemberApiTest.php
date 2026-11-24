<?php

use App\Models\Group;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->anfitrion = User::factory()->create();
    $this->invitado = User::factory()->create();

    $this->grupo = Group::factory()->create();
    $this->grupo->users()->attach($this->anfitrion->id, ['role' => 'admin', 'joined_at' => now()]);

    Sanctum::actingAs($this->anfitrion);
});

test('el anfitrión añade a una persona al grupo', function () {
    $response = $this->postJson("/api/groups/{$this->grupo->id}/members", [
        'email' => $this->invitado->email,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.id', $this->grupo->id)
        ->assertJsonCount(2, 'data.miembros');

    expect($this->grupo->users()->where('user_id', $this->invitado->id)->value('role'))->toBe('member');
});

test('rechaza un correo inexistente (422)', function () {
    $this->postJson("/api/groups/{$this->grupo->id}/members", [
        'email' => 'nadie@ejemplo.com',
    ])->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('rechaza un correo inválido (422)', function () {
    $this->postJson("/api/groups/{$this->grupo->id}/members", [
        'email' => 'no-es-un-correo',
    ])->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('rechaza añadir a alguien que ya es miembro (409)', function () {
    $this->grupo->users()->attach($this->invitado->id, ['role' => 'member', 'joined_at' => now()]);

    $this->postJson("/api/groups/{$this->grupo->id}/members", [
        'email' => $this->invitado->email,
    ])->assertStatus(409)
        ->assertJsonPath('code', 'YA_ES_MIEMBRO');
});

test('solo el anfitrión puede añadir integrantes (403)', function () {
    $this->grupo->users()->attach($this->invitado->id, ['role' => 'member', 'joined_at' => now()]);

    Sanctum::actingAs($this->invitado);

    $this->postJson("/api/groups/{$this->grupo->id}/members", [
        'email' => User::factory()->create()->email,
    ])->assertStatus(403)
        ->assertJsonPath('code', 'ACCESO_DENEGADO');
});

test('no permite añadir integrantes a un grupo ajeno (404)', function () {
    $ajeno = Group::factory()->create();
    $ajeno->users()->attach(User::factory()->create()->id, ['role' => 'admin', 'joined_at' => now()]);

    $this->postJson("/api/groups/{$ajeno->id}/members", [
        'email' => $this->invitado->email,
    ])->assertStatus(404)
        ->assertJsonPath('code', 'RECURSO_NO_ENCONTRADO');
});
