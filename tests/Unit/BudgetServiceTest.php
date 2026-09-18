<?php

use App\Exceptions\BusinessRuleException;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use App\Services\BudgetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(Tests\TestCase::class, RefreshDatabase::class);

test('aplica descuento del 10% cuando maxAmount supera los 500000', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Carbon::setTestNow(Carbon::create(2026, 1, 15));

    $budget = $service->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Presupuesto grande',
        'maxAmount' => 600000,
        'month' => 6,
        'year' => 2026,
    ]);

    expect((float) $budget->maxAmount)->toBe(540000.00);

    Carbon::setTestNow();
});

test('no aplica descuento cuando maxAmount es menor o igual a 500000', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Carbon::setTestNow(Carbon::create(2026, 1, 15));

    $budget = $service->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Presupuesto normal',
        'maxAmount' => 300000,
        'month' => 6,
        'year' => 2026,
    ]);

    expect((float) $budget->maxAmount)->toBe(300000.00);

    Carbon::setTestNow();
});

test('no permite crear presupuesto retroactivo', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Carbon::setTestNow(Carbon::create(2026, 9, 13));

    expect(fn () => $service->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Presupuesto pasado',
        'maxAmount' => 100000,
        'month' => 3,
        'year' => 2026,
    ]))->toThrow(BusinessRuleException::class, 'No se puede crear un presupuesto para un período que ya ha pasado.');

    Carbon::setTestNow();
});

test('excepción de presupuesto retroactivo tiene código PRESUPUESTO_RETROACTIVO', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Carbon::setTestNow(Carbon::create(2026, 9, 13));

    try {
        $service->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'name' => 'Pasado',
            'maxAmount' => 50000,
            'month' => 1,
            'year' => 2026,
        ]);
        $this->fail('Se esperaba BusinessRuleException');
    } catch (BusinessRuleException $e) {
        expect($e->getBusinessCode())->toBe('PRESUPUESTO_RETROACTIVO');
        expect($e->getStatusCode())->toBe(422);
    }

    Carbon::setTestNow();
});

test('permite crear presupuesto para el mes actual', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Carbon::setTestNow(Carbon::create(2026, 9, 13));

    $budget = $service->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Presupuesto actual',
        'maxAmount' => 200000,
        'month' => 9,
        'year' => 2026,
    ]);

    expect($budget)->toBeInstanceOf(Budget::class);
    expect($budget->month)->toBe(9);

    Carbon::setTestNow();
});

test('la transacción hace rollback ante un fallo intermedio', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Carbon::setTestNow(Carbon::create(2026, 9, 13));

    $countBefore = Budget::count();

    try {
        $service->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'name' => 'Fallido',
            'maxAmount' => 100000,
            'month' => 1,
            'year' => 2026,
        ]);
    } catch (BusinessRuleException $e) {

    }

    expect(Budget::count())->toBe($countBefore);

    Carbon::setTestNow();
});

test('la paginación de presupuestos respeta el tamaño máximo de 50', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Budget::factory()->count(5)->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
    ]);

    $result = $service->list(['per_page' => 200, 'user_id' => $user->id]);

    expect($result->perPage())->toBe(50);
});

test('ordena presupuestos por maxAmount correctamente', function () {
    $service = app(BudgetService::class);

    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Budget::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Bajo',
        'maxAmount' => 10000,
    ]);
    Budget::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Alto',
        'maxAmount' => 90000,
    ]);
    Budget::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'name' => 'Medio',
        'maxAmount' => 50000,
    ]);

    $result = $service->list([
        'user_id' => $user->id,
        'sort_by' => 'maxAmount',
        'sort_dir' => 'asc',
    ]);

    $amounts = $result->pluck('maxAmount')->map(fn ($v) => (float) $v)->toArray();
    expect($amounts)->toBe([10000.00, 50000.00, 90000.00]);
});
