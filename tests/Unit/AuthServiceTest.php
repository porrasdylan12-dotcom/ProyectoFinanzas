<?php

use App\Exceptions\BusinessRuleException;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('registro exitoso crea usuario y devuelve token', function () {
    $service = app(AuthService::class);

    $result = $service->register([
        'name' => 'Juan Pérez',
        'email' => 'juan@example.com',
        'password' => 'password123',
    ]);

    expect($result)->toHaveKeys(['user', 'token']);
    expect($result['user'])->toBeInstanceOf(User::class);
    expect($result['user']->name)->toBe('Juan Pérez');
    expect($result['user']->email)->toBe('juan@example.com');
    expect($result['token'])->toBeString()->not->toBeEmpty();

    $this->assertDatabaseHas('users', [
        'email' => 'juan@example.com',
    ]);

    $this->assertDatabaseCount('personal_access_tokens', 1);
});

test('registro con email duplicado lanza excepción', function () {
    $service = app(AuthService::class);

    User::factory()->create(['email' => 'duplicado@example.com']);

    expect(fn () => $service->register([
        'name' => 'Otro Usuario',
        'email' => 'duplicado@example.com',
        'password' => 'password123',
    ]))->toThrow(QueryException::class);
});

test('login con credenciales válidas devuelve usuario y token', function () {
    $service = app(AuthService::class);

    User::factory()->create([
        'email' => 'login@example.com',
        'password' => bcrypt('secreto123'),
    ]);

    $result = $service->login('login@example.com', 'secreto123');

    expect($result)->toHaveKeys(['user', 'token']);
    expect($result['user']->email)->toBe('login@example.com');
    expect($result['token'])->toBeString()->not->toBeEmpty();
});

test('login con credenciales inválidas lanza BusinessRuleException', function () {
    $service = app(AuthService::class);

    User::factory()->create([
        'email' => 'login@example.com',
        'password' => bcrypt('secreto123'),
    ]);

    expect(fn () => $service->login('login@example.com', 'contraseña_incorrecta'))
        ->toThrow(BusinessRuleException::class, 'Las credenciales proporcionadas son incorrectas.');
});

test('login con email inexistente lanza BusinessRuleException', function () {
    $service = app(AuthService::class);

    expect(fn () => $service->login('noexiste@example.com', 'password123'))
        ->toThrow(BusinessRuleException::class, 'Las credenciales proporcionadas son incorrectas.');
});

test('excepción de login inválido tiene código CREDENCIALES_INVALIDAS y status 401', function () {
    $service = app(AuthService::class);

    try {
        $service->login('noexiste@example.com', 'password123');
        $this->fail('Se esperaba BusinessRuleException');
    } catch (BusinessRuleException $e) {
        expect($e->getBusinessCode())->toBe('CREDENCIALES_INVALIDAS');
        expect($e->getStatusCode())->toBe(401);
    }
});

test('logout revoca el token actual del usuario', function () {
    $service = app(AuthService::class);

    $user = User::factory()->create();
    $tokenResult = $user->createToken('user_token', expiresAt: now()->addMinutes(30));

    $user->withAccessToken($tokenResult->accessToken);

    $this->assertDatabaseCount('personal_access_tokens', 1);

    $service->logout($user);

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('el token generado en login tiene fecha de expiración', function () {
    $service = app(AuthService::class);

    User::factory()->create([
        'email' => 'expiry@example.com',
        'password' => bcrypt('secreto123'),
    ]);

    $service->login('expiry@example.com', 'secreto123');

    $token = PersonalAccessToken::first();

    expect($token->expires_at)->not->toBeNull();
    expect($token->expires_at->isFuture())->toBeTrue();
});

test('el token generado en registro tiene fecha de expiración', function () {
    $service = app(AuthService::class);

    $service->register([
        'name' => 'Nuevo Usuario',
        'email' => 'nuevo@example.com',
        'password' => 'password123',
    ]);

    $token = PersonalAccessToken::first();

    expect($token->expires_at)->not->toBeNull();
    expect($token->expires_at->isFuture())->toBeTrue();
});

test('login exitoso limpia el contador de intentos fallidos', function () {
    $service = app(AuthService::class);

    User::factory()->create([
        'email' => 'rate@example.com',
        'password' => bcrypt('secreto123'),
    ]);

    for ($i = 0; $i < 3; $i++) {
        try {
            $service->login('rate@example.com', 'incorrecta');
        } catch (BusinessRuleException) {
        }
    }

    $result = $service->login('rate@example.com', 'secreto123');

    expect($result)->toHaveKeys(['user', 'token']);

    try {
        $service->login('rate@example.com', 'incorrecta');
    } catch (BusinessRuleException $e) {
        expect($e->getBusinessCode())->toBe('CREDENCIALES_INVALIDAS');
    }
});

test('login bloqueado tras exceder intentos', function () {
    $service = app(AuthService::class);

    User::factory()->create([
        'email' => 'bloqueo@example.com',
        'password' => bcrypt('secreto123'),
    ]);

    for ($i = 0; $i < 5; $i++) {
        try {
            $service->login('bloqueo@example.com', 'incorrecta');
        } catch (BusinessRuleException) {
        }
    }

    expect(fn () => $service->login('bloqueo@example.com', 'secreto123'))
        ->toThrow(BusinessRuleException::class);
});

test('excepción de rate limit tiene código DEMASIADOS_INTENTOS, status 429 y retry_after', function () {
    $service = app(AuthService::class);

    User::factory()->create([
        'email' => 'retry@example.com',
        'password' => bcrypt('secreto123'),
    ]);

    for ($i = 0; $i < 5; $i++) {
        try {
            $service->login('retry@example.com', 'incorrecta');
        } catch (BusinessRuleException) {
        }
    }

    try {
        $service->login('retry@example.com', 'secreto123');
        $this->fail('Se esperaba BusinessRuleException');
    } catch (BusinessRuleException $e) {
        expect($e->getBusinessCode())->toBe('DEMASIADOS_INTENTOS');
        expect($e->getStatusCode())->toBe(429);
        expect($e->getExtraData())->toHaveKey('retry_after');
        expect($e->getExtraData()['retry_after'])->toBeGreaterThan(0);
    }
});

test('el mensaje de bloqueo por rate limit no revela si el usuario existe', function () {
    $service = app(AuthService::class);

    for ($i = 0; $i < 5; $i++) {
        try {
            $service->login('fantasma@example.com', 'password123');
        } catch (BusinessRuleException) {
        }
    }

    try {
        $service->login('fantasma@example.com', 'password123');
        $this->fail('Se esperaba BusinessRuleException');
    } catch (BusinessRuleException $e) {
        expect($e->getBusinessCode())->toBe('DEMASIADOS_INTENTOS');
        expect($e->getMessage())->toContain('Demasiados intentos');
        expect($e->getMessage())->not->toContain('no existe');
        expect($e->getMessage())->not->toContain('no encontrado');
    }
});
