<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Security\Controllers\UserController;
use App\Modules\Security\Controllers\RoleController;
use App\Modules\Security\Controllers\PermissionController;

// All routes are inherently prefixed with /api/v1/security and protected by auth:sanctum + throttle:api

Route::apiResource('users', UserController::class)->parameters([
    'users' => 'uuid'
]);

Route::post('users/{userUuid}/roles/{roleUuid}', [UserController::class, 'assignRole'])
    ->name('users.assign-role');

Route::delete('users/{userUuid}/roles/{roleUuid}', [UserController::class, 'revokeRole'])
    ->name('users.revoke-role');

Route::apiResource('roles', RoleController::class)->parameters([
    'roles' => 'uuid'
]);

Route::post('roles/{roleUuid}/permissions', [RoleController::class, 'assignPermissions'])
    ->name('roles.assign-permissions');

Route::apiResource('permissions', PermissionController::class)->parameters([
    'permissions' => 'uuid'
]);
