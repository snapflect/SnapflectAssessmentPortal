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

    Route::prefix('delivery')->group(function() {
        Route::post('register', [\App\Modules\Delivery\Controllers\PublicRegistrationController::class, 'register']);
    });
});

// Protected API V1 Grouping
Route::prefix('v1')->middleware([
    \App\Http\Middleware\MockAuthMiddleware::class,
    'throttle:api',
    \App\Modules\Delivery\Middleware\ApiProblemDetailsMiddleware::class,
    'subscription.active'
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
    Route::prefix('assessment')->group(function() {
        require base_path('routes/modules/assessment.php');
    });

    // Delivery Module Routes
    Route::prefix('delivery')->group(function() {
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

    // Analytics Module Routes
    Route::prefix('analytics')->group(function() {
        require base_path('routes/modules/analytics.php');
    });

    // Billing Module Routes
    Route::prefix('billing')->group(function() {
        require base_path('routes/modules/billing.php');
    });

    // Support Module Routes
    Route::prefix('support')->group(function() {
        require base_path('routes/modules/support.php');
    });

    // Results & Scoring Module Routes
    Route::prefix('results')->group(function() {
        require base_path('routes/modules/results.php');
    });

    // Notifications Routes
    Route::prefix('notifications')->group(function() {
        Route::get('/', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::post('/read-all', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllAsRead']);
        Route::post('/{id}/read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAsRead']);
    });

    // UI Configuration & Navigation
    Route::prefix('ui')->group(function() {
        Route::get('/navigation', [\App\Http\Controllers\NavigationController::class, 'getMenu']);
    });
});

// Public Verification Route (Outside Auth Middleware)
Route::prefix('v1/certificates')->middleware(['throttle:api', \App\Modules\Delivery\Middleware\ApiProblemDetailsMiddleware::class])->group(function () {
    Route::get('/verify/{verificationCode}', [\App\Modules\Results\Controllers\CertificateVerificationController::class, 'verify']);
});
