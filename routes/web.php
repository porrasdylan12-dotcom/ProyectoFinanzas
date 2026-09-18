<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/docs', function () {
    $html = <<<'HTML'
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>API ProyectoFinanzas - Documentación</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        <style>body { margin: 0; } .swagger-ui .topbar { display: none; }</style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    url: '/docs/openapi.yaml',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                });
            };
        </script>
    </body>
    </html>
    HTML;

    return response($html)->header('Content-Type', 'text/html');
})->name('docs');

Route::get('/docs/openapi.yaml', function () {
    return response()
        ->file(base_path('docs/openapi.yaml'), ['Content-Type' => 'application/yaml']);
});

require __DIR__.'/settings.php';
