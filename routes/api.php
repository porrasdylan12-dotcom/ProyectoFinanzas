<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupDebtController;
use App\Http\Controllers\SharedExpensesController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::post('/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:5,1')
    ->name('api.forgot-password');
Route::post('/sanctum/token', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('api.sanctum.token');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'show'])->name('api.user');
    Route::patch('/user', [UserController::class, 'update'])->name('api.user.update');
    Route::put('/user/password', [UserController::class, 'updatePassword'])->name('api.user.password.update');

    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    $escritura = ['role:user'];

    Route::apiResource('accounts', AccountController::class)->only(['index', 'show'])->names('api.accounts');
    Route::post('accounts', [AccountController::class, 'store'])->middleware($escritura)->name('api.accounts.store');
    Route::match(['put', 'patch'], 'accounts/{account}', [AccountController::class, 'update'])->middleware($escritura)->name('api.accounts.update');
    Route::delete('accounts/{account}', [AccountController::class, 'destroy'])->middleware($escritura)->name('api.accounts.destroy');

    Route::apiResource('budgets', BudgetController::class)->only(['index', 'show'])->names('api.budgets');
    Route::post('budgets', [BudgetController::class, 'store'])->middleware($escritura)->name('api.budgets.store');
    Route::match(['put', 'patch'], 'budgets/{budget}', [BudgetController::class, 'update'])->middleware($escritura)->name('api.budgets.update');
    Route::delete('budgets/{budget}', [BudgetController::class, 'destroy'])->middleware($escritura)->name('api.budgets.destroy');

    Route::apiResource('categories', CategoryController::class)->only(['index', 'show'])->names('api.categories');
    Route::post('categories', [CategoryController::class, 'store'])->middleware($escritura)->name('api.categories.store');
    Route::match(['put', 'patch'], 'categories/{category}', [CategoryController::class, 'update'])->middleware($escritura)->name('api.categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware($escritura)->name('api.categories.destroy');

    Route::apiResource('transactions', TransactionController::class)->only(['index', 'show'])->names('api.transactions');
    Route::post('transactions', [TransactionController::class, 'store'])->middleware($escritura)->name('api.transactions.store');
    Route::match(['put', 'patch'], 'transactions/{transaction}', [TransactionController::class, 'update'])->middleware($escritura)->name('api.transactions.update');
    Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])->middleware($escritura)->name('api.transactions.destroy');

    Route::apiResource('groups', GroupController::class)->only(['index', 'show'])->names('api.groups');
    Route::post('groups', [GroupController::class, 'store'])->middleware($escritura)->name('api.groups.store');
    Route::match(['put', 'patch'], 'groups/{group}', [GroupController::class, 'update'])->middleware($escritura)->name('api.groups.update');
    Route::delete('groups/{group}', [GroupController::class, 'destroy'])->middleware($escritura)->name('api.groups.destroy');
    Route::post('groups/{group}/members', [GroupController::class, 'addMember'])->middleware($escritura)->name('api.groups.members.store');

    Route::apiResource('shared-expenses', SharedExpensesController::class)->only(['index', 'show'])->names('api.shared-expenses');
    Route::post('shared-expenses', [SharedExpensesController::class, 'store'])->middleware($escritura)->name('api.shared-expenses.store');
    Route::match(['put', 'patch'], 'shared-expenses/{shared_expense}', [SharedExpensesController::class, 'update'])->middleware($escritura)->name('api.shared-expenses.update');
    Route::delete('shared-expenses/{shared_expense}', [SharedExpensesController::class, 'destroy'])->middleware($escritura)->name('api.shared-expenses.destroy');

    Route::apiResource('group-debts', GroupDebtController::class)->only(['index', 'show'])->names('api.group-debts');
    Route::post('group-debts', [GroupDebtController::class, 'store'])->middleware($escritura)->name('api.group-debts.store');
    Route::match(['put', 'patch'], 'group-debts/{group_debt}', [GroupDebtController::class, 'update'])->middleware($escritura)->name('api.group-debts.update');
    Route::delete('group-debts/{group_debt}', [GroupDebtController::class, 'destroy'])->middleware($escritura)->name('api.group-debts.destroy');

    Route::get('/accounts/{account}/transactions', [TransactionController::class, 'forAccount'])
        ->name('api.accounts.transactions.index');
    Route::post('/accounts/{account}/transactions', [TransactionController::class, 'storeInAccount'])
        ->middleware($escritura)
        ->name('api.accounts.transactions.store');

    Route::get('/groups/{group}/shared-expenses', [SharedExpensesController::class, 'forGroup'])
        ->name('api.groups.shared-expenses.index');
    Route::post('/groups/{group}/shared-expenses', [SharedExpensesController::class, 'storeInGroup'])
        ->middleware($escritura)
        ->name('api.groups.shared-expenses.store');

    Route::get('/shared-expenses/{sharedExpense}/group-debts', [GroupDebtController::class, 'forSharedExpense'])
        ->name('api.shared-expenses.group-debts.index');
    Route::post('/shared-expenses/{sharedExpense}/group-debts', [GroupDebtController::class, 'storeInSharedExpense'])
        ->middleware($escritura)
        ->name('api.shared-expenses.group-debts.store');

    Route::middleware('role:admin')->prefix('admin')->name('api.admin.')->group(function () {
        Route::get('/users', [AdminController::class, 'users'])->name('users.index');
        Route::get('/roles', [AdminController::class, 'roles'])->name('roles.index');
    });

});
