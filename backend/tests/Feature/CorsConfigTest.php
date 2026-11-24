<?php

test('CORS permite los orígenes del front web y móvil', function () {
    $origines = config('cors.allowed_origins');

    expect($origines)
        ->toBeArray()
        ->toContain('https://proyecto-finanzas.erick-serrano.workers.dev')
        ->toContain('https://erick-serrano.workers.dev')
        ->toContain('capacitor://localhost');
});
