<?php

test('devuelve una respuesta satisfactoria', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});
