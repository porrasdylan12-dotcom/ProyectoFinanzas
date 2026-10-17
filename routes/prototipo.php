<?php

use App\Http\Controllers\PrototipoController;
use Illuminate\Support\Facades\Route;

Route::get('/prototipo/{pagina}.html', [PrototipoController::class, 'page'])
    ->where('pagina', '[A-Za-z0-9_-]+')
    ->name('prototipo.page');

Route::get('/css/{archivo}', [PrototipoController::class, 'css'])
    ->where('archivo', '[A-Za-z0-9_./-]+')
    ->name('prototipo.css');

Route::get('/js/prototipo/{ruta}', [PrototipoController::class, 'js'])
    ->where('ruta', '[A-Za-z0-9_./-]+')
    ->name('prototipo.js');
