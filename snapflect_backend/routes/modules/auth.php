<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Security\Controllers\AuthController;

// Public Auth Routes
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword']);

// Protected Auth Routes (Middleware disabled for manual testing without Sanctum)
Route::group([], function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
});
