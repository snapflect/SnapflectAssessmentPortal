<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Modules\Results\Controllers\CandidateResultsController;
use App\Modules\Results\Controllers\AdminAnalyticsController;
use App\Modules\Results\Controllers\LeaderboardController;
use App\Modules\Results\Controllers\CertificateController;

// -----------------------------------------------------------------------------
// Candidate Results API
// -----------------------------------------------------------------------------
Route::prefix('candidates/results')->group(function () {
    Route::get('/history', [CandidateResultsController::class, 'history']);
    Route::get('/{resultUuid}', [CandidateResultsController::class, 'show']);
    Route::get('/{resultUuid}/competencies', [CandidateResultsController::class, 'competencies']);
    Route::get('/{resultUuid}/certificate/download', [CertificateController::class, 'downloadByResult']);
});

// -----------------------------------------------------------------------------
// Admin Analytics API
// -----------------------------------------------------------------------------
Route::prefix('admin/analytics')->group(function () {
    Route::get('/assessments/{assessmentUuid}', [AdminAnalyticsController::class, 'assessmentSummary']);
    Route::get('/competencies/{assessmentUuid}', [AdminAnalyticsController::class, 'competencySummaries']);
    Route::get('/questions/{assessmentUuid}', [AdminAnalyticsController::class, 'questionSummaries']);
});

// -----------------------------------------------------------------------------
// Leaderboards API
// -----------------------------------------------------------------------------
Route::prefix('leaderboards')->group(function () {
    Route::get('/{assessmentUuid}', [LeaderboardController::class, 'show']);
    Route::get('/{assessmentUuid}/top', [LeaderboardController::class, 'top']);
});

// -----------------------------------------------------------------------------
// Protected Certificate Download API (Candidates/Admins)
// -----------------------------------------------------------------------------
Route::prefix('certificates')->group(function () {
    Route::get('/', [CertificateController::class, 'index']);
    Route::get('/{certificateUuid}', [CertificateController::class, 'show']);
    Route::get('/{certificateUuid}/download', [CertificateController::class, 'download']);
});
