<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PrototipoController extends Controller
{
    private const BOOTSTRAP = '/js/prototipo/main.js';

    public function page(string $pagina): Response
    {
        $archivo = $this->resolver('resources/views/prototipo', "{$pagina}.html");

        return new Response(
            $this->inyectarBootstrap((string) file_get_contents($archivo)),
            200,
            ['Content-Type' => 'text/html; charset=UTF-8'],
        );
    }

    public function css(string $archivo): BinaryFileResponse
    {
        return $this->serve('resources/css', $archivo, 'text/css');
    }

    public function js(string $ruta): BinaryFileResponse
    {
        return $this->serve('resources/js/prototipo', $ruta, 'text/javascript');
    }

    private function inyectarBootstrap(string $html): string
    {
        if (
            $html === ''
            || str_contains($html, self::BOOTSTRAP)
            || ! str_contains($html, '</body>')
        ) {
            return $html;
        }

        $script = '        <script type="module" src="'.self::BOOTSTRAP."\"></script>\n";

        return str_replace('</body>', $script.'    </body>', $html);
    }

    private function serve(string $root, string $relativePath, string $contentType): BinaryFileResponse
    {
        return response()->file($this->resolver($root, $relativePath), [
            'Content-Type' => $contentType.'; charset=UTF-8',
        ]);
    }

    private function resolver(string $root, string $relativePath): string
    {
        if (str_contains($relativePath, '..')) {
            throw new NotFoundHttpException;
        }

        $base = realpath(base_path($root));

        if ($base === false) {
            throw new NotFoundHttpException;
        }

        $candidato = realpath($base.DIRECTORY_SEPARATOR.$relativePath);

        if (
            $candidato === false
            || ! is_file($candidato)
            || ! str_starts_with($candidato, $base.DIRECTORY_SEPARATOR)
        ) {
            throw new NotFoundHttpException;
        }

        return $candidato;
    }
}
