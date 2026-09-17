<?php

use App\Exceptions\BusinessRuleException;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AccountService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

test('no permite eliminar cuenta con transacciones activas', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    Transaction::factory()->create(['account_id' => $account->id]);

    expect(fn () => $service->delete($account))
        ->toThrow(BusinessRuleException::class, 'No se puede eliminar la cuenta porque tiene transacciones asociadas.');
});

test('excepción de eliminar cuenta con dependencias tiene código CUENTA_CON_DEPENDENCIAS', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    Transaction::factory()->create(['account_id' => $account->id]);

    try {
        $service->delete($account);
        $this->fail('Se esperaba BusinessRuleException');
    } catch (BusinessRuleException $e) {
        expect($e->getBusinessCode())->toBe('CUENTA_CON_DEPENDENCIAS');
        expect($e->getStatusCode())->toBe(409);
    }
});

test('permite eliminar cuenta sin transacciones', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $result = $service->delete($account);

    expect($result)->toBeTrue();
    expect(Account::find($account->id))->toBeNull();
});

test('no permite crear cuenta de efectivo duplicada con balance mayor a cero', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();

    // Crear primera cuenta de efectivo
    Account::factory()->create([
        'user_id' => $user->id,
        'type' => 'efectivo',
        'balance' => 1000,
    ]);

    expect(fn () => $service->create([
        'user_id' => $user->id,
        'name' => 'Otra cuenta efectivo',
        'type' => 'efectivo',
        'balance' => 500,
    ]))->toThrow(BusinessRuleException::class, 'El usuario ya tiene una cuenta de efectivo');
});

test('permite crear cuenta de efectivo con balance cero aunque exista otra', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();

    Account::factory()->create([
        'user_id' => $user->id,
        'type' => 'efectivo',
        'balance' => 1000,
    ]);

    $account = $service->create([
        'user_id' => $user->id,
        'name' => 'Efectivo secundario',
        'type' => 'efectivo',
        'balance' => 0,
    ]);

    expect($account)->toBeInstanceOf(Account::class);
    expect($account->balance)->toBe('0.00');
});

test('la paginación respeta el tamaño máximo de 50', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();
    Account::factory()->count(5)->create(['user_id' => $user->id]);

    $result = $service->list(['per_page' => 100, 'user_id' => $user->id]);

    expect($result->perPage())->toBe(50);
});

test('ordena cuentas por nombre correctamente', function () {
    $service = app(AccountService::class);

    $user = User::factory()->create();

    Account::factory()->create(['user_id' => $user->id, 'name' => 'Zebra']);
    Account::factory()->create(['user_id' => $user->id, 'name' => 'Alfa']);
    Account::factory()->create(['user_id' => $user->id, 'name' => 'Meta']);

    $result = $service->list(['user_id' => $user->id, 'sort_by' => 'name', 'sort_dir' => 'asc']);

    $names = $result->pluck('name')->toArray();
    expect($names)->toBe(['Alfa', 'Meta', 'Zebra']);
});
