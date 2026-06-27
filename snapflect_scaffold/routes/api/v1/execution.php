<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Delivery\Controllers\AssessmentLaunchController;
use App\Modules\Delivery\Controllers\AttemptTimerController;
use App\Modules\Delivery\Controllers\AttemptAutoSaveController;
use App\Modules\Delivery\Controllers\AttemptResumeController;
use App\Modules\Delivery\Controllers\AttemptSubmissionController;

// Prefixed with /api/v1 and protected by auth:sanctum middleware via RouteServiceProvider/api.php

Route::post('/assessments/{assessment_uuid}/launch', AssessmentLaunchController::class);

Route::prefix('/attempts/{attempt_uuid}')->group(function () {
    Route::get('/timer', AttemptTimerController::class);
    Route::post('/save', AttemptAutoSaveController::class);
    Route::get('/resume', AttemptResumeController::class);
    Route::post('/submit', AttemptSubmissionController::class);
});
