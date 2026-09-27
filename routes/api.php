<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupDebtController;
use App\Http\Controllers\SharedExpensesController;
use App\Http\Controllers\TransactionController;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn () => new UserResource(request()->user()))
        ->name('api.user');

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('accounts', AccountController::class)->names('api.accounts');
    Route::apiResource('budgets', BudgetController::class)->names('api.budgets');
    Route::apiResource('categories', CategoryController::class)->names('api.categories');
    Route::apiResource('transactions', TransactionController::class)->names('api.transactions');
    Route::apiResource('groups', GroupController::class)->names('api.groups');
    Route::apiResource('shared-expenses', SharedExpensesController::class)->names('api.shared-expenses');
    Route::apiResource('group-debts', GroupDebtController::class)->names('api.group-debts');

    Route::get('/accounts/{account}/transactions', [TransactionController::class, 'forAccount'])
        ->name('api.accounts.transactions.index');
    Route::post('/accounts/{account}/transactions', [TransactionController::class, 'storeInAccount'])
        ->name('api.accounts.transactions.store');

    Route::get('/groups/{group}/shared-expenses', [SharedExpensesController::class, 'forGroup'])
        ->name('api.groups.shared-expenses.index');
    Route::post('/groups/{group}/shared-expenses', [SharedExpensesController::class, 'storeInGroup'])
        ->name('api.groups.shared-expenses.store');

    Route::get('/shared-expenses/{sharedExpense}/group-debts', [GroupDebtController::class, 'forSharedExpense'])
        ->name('api.shared-expenses.group-debts.index');
    Route::post('/shared-expenses/{sharedExpense}/group-debts', [GroupDebtController::class, 'storeInSharedExpense'])
        ->name('api.shared-expenses.group-debts.store');
});

