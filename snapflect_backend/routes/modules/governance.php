<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Governance\Controllers\OrganizationController;
use App\Modules\Governance\Controllers\BusinessUnitController;
use App\Modules\Governance\Controllers\DepartmentController;
use App\Modules\Governance\Controllers\LocationController;

// All routes are inherently prefixed with /api/v1/governance and protected by auth:sanctum + throttle:api

Route::get('organizations/{uuid}/billing', [OrganizationController::class, 'billing']);
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
