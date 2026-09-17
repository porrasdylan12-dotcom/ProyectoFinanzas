<?php

namespace App\Exceptions;

use Exception;

class Regla500Exception extends Exception
{
    public function report(): void
    {

    }

    public function render($request)
    {
        return response([
            'error' => 'Error interno del servidor',
            'message' => $this->getMessage(),
        ], 409);
    }
}
