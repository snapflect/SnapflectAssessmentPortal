<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Support\Controllers\TicketController;

// Tickets
Route::get('/tickets', [TicketController::class, 'index']);
Route::post('/tickets', [TicketController::class, 'store']);
Route::get('/tickets/{id}', [TicketController::class, 'show']);
Route::post('/tickets/{id}/replies', [TicketController::class, 'reply']);
Route::put('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
