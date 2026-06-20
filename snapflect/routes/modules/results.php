<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Modules\Results\Controllers\AssessmentResultController;
use App\Modules\Results\Controllers\ResultPublicationController;
use App\Modules\Results\Controllers\ManualReviewController;
use App\Modules\Results\Controllers\ReportingController;

/*
|--------------------------------------------------------------------------
| Results & Scoring Module Routes
|--------------------------------------------------------------------------
|
| Registered under /api/v1/results
| Middleware: auth:sanctum, throttle:api (enforced in api.php)
|
*/

// --- Assessment Results ---
Route::get('/', [AssessmentResultController::class, 'index']);
Route::get('/{result:uuid}', [AssessmentResultController::class, 'show']);
Route::post('/calculate', [AssessmentResultController::class, 'calculate']);
Route::post('/{result:uuid}/recalculate', [AssessmentResultController::class, 'recalculate']);
Route::get('/{result:uuid}/question-scores', [AssessmentResultController::class, 'questionScores']);
Route::get('/{result:uuid}/section-scores', [AssessmentResultController::class, 'sectionScores']);
Route::get('/{result:uuid}/competency-scores', [AssessmentResultController::class, 'competencyScores']);
Route::get('/{result:uuid}/versions', [AssessmentResultController::class, 'versions']);
Route::get('/{result:uuid}/snapshot', [AssessmentResultController::class, 'snapshot']);
Route::get('/{result:uuid}/audits', [AssessmentResultController::class, 'audits']);

// --- Publications ---
Route::post('/{result:uuid}/publish', [ResultPublicationController::class, 'publish']);
Route::post('/{result:uuid}/archive', [ResultPublicationController::class, 'archive']);
Route::get('/{result:uuid}/publication', [ResultPublicationController::class, 'showPublication']);

// --- Manual Score Reviews ---
Route::get('/{result:uuid}/manual-reviews', [ManualReviewController::class, 'index']);
Route::post('/{result:uuid}/manual-reviews', [ManualReviewController::class, 'store']);
Route::get('/manual-reviews/{review:uuid}', [ManualReviewController::class, 'show']);
Route::patch('/manual-reviews/{review:uuid}', [ManualReviewController::class, 'update']);

// --- Reporting ---
Route::get('/reports/assessments/{assessment_uuid}', [ReportingController::class, 'assessmentReport']);
Route::get('/reports/competencies/{competency_uuid}', [ReportingController::class, 'competencyReport']);
Route::get('/reports/pass-fail', [ReportingController::class, 'passFailReport']);
Route::get('/reports/candidates/{candidate_uuid}', [ReportingController::class, 'candidateReport']);
