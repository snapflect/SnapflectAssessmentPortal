<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Billing\Controllers\BillingController;

Route::get('/subscriptions/current', [BillingController::class, 'currentSubscription']);
Route::get('/invoices', [BillingController::class, 'invoices']);
Route::get('/invoices/{uuid}/download', [BillingController::class, 'download']);
Route::get('/plans', [BillingController::class, 'plans']);

// Platform Admin Billing Routes
Route::get('/admin/clients', [BillingController::class, 'platformClients']);
Route::get('/admin/invoices', [BillingController::class, 'platformInvoices']);
