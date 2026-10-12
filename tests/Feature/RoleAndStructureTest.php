<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleAndStructureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);
    }

    public function test_rechaza_acceso_sin_token_a_ruta_protegida_con_401()
    {
        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(401)
            ->assertJsonStructure(['message']);
    }

    public function test_deniega_acceso_a_panel_admin_si_no_tiene_el_rol_correcto_con_403()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_permite_acceso_a_panel_admin_con_rol_correcto_y_valida_json()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'nombre',
                        'email',
                        'creada',
                        'actualizada',
                    ],
                ],
                'links',
                'meta',
            ]);
    }

    public function test_rechaza_creacion_de_cuenta_sin_token_con_401()
    {
        $payload = [
            'name' => 'Cuenta Nueva',
            'type' => 'ahorros',
            'balance' => 500.00,
        ];

        $response = $this->postJson('/api/accounts', $payload);

        $response->assertStatus(401);
    }

    public function test_deniega_creacion_de_cuenta_sin_rol_user_con_403()
    {
        $userWithoutRole = User::factory()->create();
        $userWithoutRole->syncRoles([]);

        $payload = [
            'name' => 'Cuenta Nueva',
            'type' => 'ahorros',
            'balance' => 500.00,
        ];

        $response = $this->actingAs($userWithoutRole)->postJson('/api/accounts', $payload);

        $response->assertStatus(403);
    }

    public function test_permite_creacion_de_cuenta_con_rol_user_y_valida_json()
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        $payload = [
            'name' => 'Cuenta Principal',
            'type' => 'corriente',
            'balance' => 1500.75,
        ];

        $response = $this->actingAs($user)->postJson('/api/accounts', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'user_id',
                    'nombre',
                    'saldo',
                    'tipo',
                    'creada',
                    'actualizada',
                ],
            ]);
    }
}
