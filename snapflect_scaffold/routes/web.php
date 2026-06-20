<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json(['message' => 'Snapflect Assessment Portal API']);
});

// Placeholder authenticated web routes (no Blade views generated as per requirements)
Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::get('/dashboard', function () {
        return response()->json(['message' => 'Dashboard Placeholder']);
    })->name('dashboard');

    Route::get('/profile', function () {
        return response()->json(['message' => 'Profile Placeholder']);
    })->name('profile');

});
