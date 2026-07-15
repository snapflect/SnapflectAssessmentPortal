<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Governance\Controllers\OrganizationController;
use App\Modules\Governance\Controllers\BusinessUnitController;
use App\Modules\Governance\Controllers\DepartmentController;
use App\Modules\Governance\Controllers\LocationController;
use App\Modules\Governance\Controllers\DraftController;

// All routes are inherently prefixed with /api/v1/governance and protected by auth:sanctum + throttle:api

Route::post('drafts/{entityType}/{entityId}', [DraftController::class, 'store']);
Route::get('drafts/{entityType}/{entityId}', [DraftController::class, 'show']);

Route::get('organizations/{uuid}/billing', [OrganizationController::class, 'billing']);
    Route::post('organizations/upload-logo', [\App\Modules\Governance\Controllers\OrganizationController::class, 'uploadLogo']);
    Route::post('organizations/{uuid}/invite-admin', [\App\Modules\Governance\Controllers\OrganizationController::class, 'inviteAdmin']);
    Route::put('organizations/{uuid}/smtp', [\App\Modules\Governance\Controllers\OrganizationController::class, 'updateSmtp']);
Route::apiResource('organizations', OrganizationController::class)->parameters([
    'organizations' => 'uuid'
]);

Route::apiResource('business-units', BusinessUnitController::class)->parameters([
    'business-units' => 'uuid'
]);

Route::apiResource('departments', DepartmentController::class)->parameters([
    'departments' => 'uuid'
]);

Route::apiResource('locations', LocationController::class)->parameters([
    'locations' => 'uuid'
]);

// Bulk Data Ingestion
Route::post('bulk-onboarding', [\App\Modules\Governance\Controllers\BulkOnboardingController::class, 'upload']);
