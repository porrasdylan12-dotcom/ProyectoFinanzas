<?php

use Illuminate\Support\Facades\DB;

test('la tabla de sesiones permite almacenar una sesión', function () {
    DB::table('sessions')->insert([
        'id' => 'sesion-de-prueba',
        'user_id' => null,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'payload' => serialize(['usuario' => 1]),
        'last_activity' => 1_700_000_000,
    ]);

    $this->assertDatabaseHas('sessions', [
        'id' => 'sesion-de-prueba',
        'ip_address' => '127.0.0.1',
        'last_activity' => 1_700_000_000,
    ]);
});
