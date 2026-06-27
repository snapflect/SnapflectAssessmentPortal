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
Route::prefix('v1')->middleware([
    'auth:sanctum', 
    'throttle:api',
    \App\Modules\Delivery\Middleware\ApiProblemDetailsMiddleware::class
])->group(function () {
    
    // Governance Module Routes
    Route::prefix('governance')->group(function() {
        require base_path('routes/modules/governance.php');
    });
    
    // Security Module Routes
    Route::prefix('security')->group(function() {
        require base_path('routes/modules/security.php');
    });

    // Assessment Module Routes
    Route::group([], function() {
        require base_path('routes/modules/assessment.php');
    });

    // Delivery Module Routes
    Route::group([], function() {
        require base_path('routes/modules/delivery.php');
    });

    // Execution API Exposure Layer (Sprint 06.5)
    Route::group([], function() {
        require base_path('routes/api/v1/execution.php');
    });

    // Results API Exposure Layer (Sprint 08)
    Route::group([], function() {
        require base_path('routes/api/v1/results_api.php');
    });
});

// Public Verification Route (Outside Auth Middleware)
Route::prefix('v1/certificates')->middleware(['throttle:api', \App\Modules\Delivery\Middleware\ApiProblemDetailsMiddleware::class])->group(function () {
    Route::get('/verify/{verificationCode}', [\App\Modules\Results\Controllers\CertificateVerificationController::class, 'verify']);
});
