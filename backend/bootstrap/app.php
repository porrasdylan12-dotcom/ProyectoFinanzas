<?php

use App\Exceptions\BusinessRuleException;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\DevCommands;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // spatie/laravel-permission no registra sus propios alias de middleware.
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(
            fn (BusinessRuleException $e, Request $request): ?Response => ($request->is('api/*') || $request->expectsJson())
                ? response()->json(array_merge([
                    'message' => $e->getMessage(),
                    'code' => $e->getBusinessCode(),
                ], $e->getExtraData()), $e->getStatusCode())
                : null,
        );

        $exceptions->render(
            fn (NotFoundHttpException $e, Request $request): ?Response => ($request->is('api/*') || $request->expectsJson())
                ? response()->json([
                    'message' => 'El recurso solicitado no existe.',
                    'code' => 'RECURSO_NO_ENCONTRADO',
                ], 404)
                : null,
        );

        $exceptions->render(
            fn (AuthenticationException $e, Request $request): ?Response => ($request->is('api/*') || $request->expectsJson())
                ? response()->json([
                    'message' => 'No se encontró un token de autenticación válido.',
                    'code' => 'NO_AUTENTICADO',
                ], 401)
                : null,
        );

        $exceptions->render(
            fn (AccessDeniedHttpException $e, Request $request): ?Response => ($request->is('api/*') || $request->expectsJson())
                ? response()->json([
                    'message' => 'No tienes permisos para realizar esta acción.',
                    'code' => 'ACCESO_DENEGADO',
                ], 403)
                : null,
        );

        $exceptions->render(
            fn (ValidationException $e, Request $request): ?Response => ($request->is('api/*') || $request->expectsJson())
                ? response()->json([
                    'message' => 'Los datos enviados no son válidos.',
                    'code' => 'DATOS_INVALIDOS',
                    'errors' => $e->errors(),
                ], 422)
                : null,
        );

        $exceptions->respond(function (Response $response, Throwable $e, Request $request): Response {
            if (
                $response->getStatusCode() === 500
                && ($request->is('api/*') || $request->expectsJson())
            ) {
                return response()->json([
                    'message' => 'Ocurrió un error interno en el servidor.',
                    'code' => 'ERROR_INTERNO',
                ], 500);
            }

            return $response;
        });
    })->create();

DevCommands::register('npm --prefix ../web run dev', 'vite');

return $app;
