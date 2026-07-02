<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Analytics\Controllers\DashboardController;

// Prefix /api/v1/analytics
Route::get('dashboard/summary', [DashboardController::class, 'summary']);
Route::get('authoring/summary', [\App\Http\Controllers\Api\V1\Analytics\AuthoringAnalyticsController::class, 'summary']);
Route::get('reviewer/summary', [\App\Http\Controllers\Api\V1\Analytics\ReviewerAnalyticsController::class, 'summary']);
