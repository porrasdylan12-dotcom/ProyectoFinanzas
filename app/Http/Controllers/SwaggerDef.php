<?php

namespace App\Http\Controllers;

// Importamos la versión de Atributos, no de Anotaciones
use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    description: "Documentación de la API REST para el Laboratorio 5",
    title: "API de Proyecto Finanzas"
)]
class SwaggerDef
{
}