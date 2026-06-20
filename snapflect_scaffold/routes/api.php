<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public API V1 Grouping
Route::prefix('v1')->middleware(['throttle:api'])->group(function () {
    Route::prefix('auth')->group(function() {
        require base_path('routes/modules/auth.php');
    });
});

// Protected API V1 Grouping
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Governance Module Routes
    Route::prefix('governance')->group(function() {
        require base_path('routes/modules/governance.php');
    });
    
    // Security Module Routes
    Route::prefix('security')->group(function() {
        require base_path('routes/modules/security.php');
    });

    // Assessment Module Routes
    Route::prefix('assessment')->group(function() {
        require base_path('routes/modules/assessment.php');
    });

    // Delivery Module Routes
    Route::prefix('delivery')->group(function() {
        require base_path('routes/modules/delivery.php');
    });

    // Results Module Routes
    Route::prefix('results')->group(function() {
        require base_path('routes/modules/results.php');
    });

});
