<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('accounts', AccountController::class)->middleware('auth:sanctum');
Route::post('/sanctum/token', LoginController::class);
