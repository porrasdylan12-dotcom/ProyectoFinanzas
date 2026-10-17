<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PrototipoController extends Controller
{
    public function page(string $pagina): BinaryFileResponse
    {
        return $this->serve('resources/views/prototipo', "{$pagina}.html", 'text/html');
    }

    public function css(string $archivo): BinaryFileResponse
    {
        return $this->serve('resources/css', $archivo, 'text/css');
    }

    public function js(string $ruta): BinaryFileResponse
    {
        return $this->serve('resources/js/prototipo', $ruta, 'application/javascript');
    }

    private function serve(string $root, string $relativePath, string $contentType): BinaryFileResponse
    {
        if (str_contains($relativePath, '..')) {
            throw new NotFoundHttpException;
        }

        $base = realpath(base_path($root));

        if ($base === false) {
            throw new NotFoundHttpException;
        }

        $candidate = realpath($base.DIRECTORY_SEPARATOR.$relativePath);

        if (
            $candidate === false
            || ! is_file($candidate)
            || ! str_starts_with($candidate, $base.DIRECTORY_SEPARATOR)
        ) {
            throw new NotFoundHttpException;
        }

        return response()->file($candidate, [
            'Content-Type' => $contentType.'; charset=UTF-8',
        ]);
    }
}
