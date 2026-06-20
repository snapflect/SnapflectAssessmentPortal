<?php

use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('login', function () {
    return response()->json([
        'success' => true,
        'data' => [
            'token' => 'mock-jwt-token-12345',
            'user' => [
                'id' => 1,
                'name' => 'Mock User',
                'email' => 'candidate@client.com',
                'role' => 'candidate'
            ]
        ]
    ]);
});

Route::post('forgot-password', function () {
    return response()->json([
        'success' => true,
        'message' => 'Password reset link sent'
    ]);
});

// Protected Auth Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', function () {
        return response()->json(['success' => true]);
    });

    Route::get('me', function () {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => 1,
                    'name' => 'Mock User',
                    'email' => 'candidate@client.com',
                    'role' => 'candidate'
                ]
            ]
        ]);
    });
});
