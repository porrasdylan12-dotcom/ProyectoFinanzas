<?php

test('sirve una página del prototipo con contenido HTML', function () {
    $response = $this->get('/prototipo/login.html');

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/html');
});

test('sirve una página del prototipo con mayúsculas en el nombre', function () {
    $this->get('/prototipo/Registro.html')->assertOk();
});

test('sirve una hoja de estilos del prototipo', function () {
    $response = $this->get('/css/estilos.css');

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/css');
});

test('sirve un módulo JavaScript del prototipo', function () {
    $response = $this->get('/js/prototipo/core/index.js');

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('javascript');
});

test('devuelve 404 para una página inexistente', function () {
    $this->get('/prototipo/no-existe.html')->assertNotFound();
});

test('devuelve 404 para un recurso inexistente', function () {
    $this->get('/css/no-existe.css')->assertNotFound();
});

test('bloquea el acceso a archivos fuera de la carpeta permitida', function () {
    $this->get('/js/prototipo/..%2F..%2F..%2Fpackage.json')->assertNotFound();
});
