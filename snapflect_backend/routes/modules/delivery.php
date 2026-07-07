<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Delivery\Controllers\AssessmentSessionController;
use App\Modules\Delivery\Controllers\AssessmentAttemptController;
use App\Modules\Delivery\Controllers\TelemetryController;
use App\Modules\Delivery\Controllers\AttemptQuestionController;
use App\Modules\Delivery\Controllers\CandidateAnswerController;
use App\Modules\Delivery\Controllers\AttemptSubmissionController;
use App\Modules\Delivery\Controllers\ProctoringController;

Route::group([], function () {
    // Proctoring Routes
    Route::get('/proctoring/live', [ProctoringController::class, 'liveSessions']);
    // Candidate Dashboard Route
    Route::get('/my-assessments', [\App\Modules\Delivery\Controllers\CandidateDashboardController::class, 'index']);

    // Session Routes
    Route::get('/sessions', [\App\Modules\Delivery\Controllers\SessionLaunchController::class, 'index']);
    Route::post('/sessions', [\App\Modules\Delivery\Controllers\SessionLaunchController::class, 'store']);
    Route::post('/sessions/{session_uuid}/launch', [\App\Modules\Delivery\Controllers\SessionLaunchController::class, 'launch']);
    Route::get('/sessions/{session_uuid}', [\App\Modules\Delivery\Controllers\SessionLaunchController::class, 'show']);
    Route::post('/sessions/{session:uuid}/terminate', [\App\Modules\Delivery\Controllers\AssessmentSessionController::class, 'terminate']);
    Route::post('/sessions/{session:uuid}/resume', [\App\Modules\Delivery\Controllers\AssessmentSessionController::class, 'resume']);

    // Attempt Routes
    Route::get('/attempts/{attempt:uuid}', [AssessmentAttemptController::class, 'show']);
    Route::get('/attempts/{attempt:uuid}/progress', [AssessmentAttemptController::class, 'progress']);
    Route::post('/attempts/{attempt:uuid}/submit', [AssessmentAttemptController::class, 'submit']);
    Route::post('/attempts/{attempt:uuid}/expire', [AssessmentAttemptController::class, 'expire']);
    Route::get('/attempts/{attempt:uuid}/result', [AssessmentAttemptController::class, 'result']);

    // Question Routes
    Route::get('/attempts/{attempt:uuid}/questions', [AttemptQuestionController::class, 'index']);
    Route::get('/questions/{question:uuid}', [AttemptQuestionController::class, 'show']);
    // Mapping next/previous/jump to use attempt or question as per controller signatures.
    // The controllers for next/previous expect AssessmentAttempt, so we bind {attempt:uuid}
    Route::get('/questions/{attempt:uuid}/next', [AttemptQuestionController::class, 'next']);
    Route::get('/questions/{attempt:uuid}/previous', [AttemptQuestionController::class, 'previous']);
    Route::get('/attempts/{attempt:uuid}/questions/{question:uuid}', [AttemptQuestionController::class, 'jump']);
    Route::post('/questions/{question:uuid}/flag', [AttemptQuestionController::class, 'flag']);
    Route::post('/questions/{question:uuid}/unflag', [AttemptQuestionController::class, 'unflag']);

    // Telemetry Route
    Route::get('/telemetry', [TelemetryController::class, 'getTelemetry']);

    // Answer Routes
    // Note: 'store' and 'autoSave' methods expect an attempt in the URL for RMB, or they fetch from payload.
    // Given the URI map doesn't include {attempt} in POST /answers, the controller might fail if it typehints AssessmentAttempt $attempt but route doesn't have it.
    // However, the rule states to generate routes exactly as provided. We'll map them strictly.
    Route::post('/attempts/{attempt:uuid}/answers', [CandidateAnswerController::class, 'store']);
    Route::put('/answers/{answer:uuid}', [CandidateAnswerController::class, 'update']);
    Route::post('/attempts/{attempt:uuid}/answers/auto-save', [CandidateAnswerController::class, 'autoSave']);
    Route::get('/answers/{answer:uuid}', [CandidateAnswerController::class, 'show']);

    // Submission Routes
    Route::get('/submissions/{submission:uuid}', [AttemptSubmissionController::class, 'show']);
    Route::get('/attempts/{attempt:uuid}/events', [AttemptSubmissionController::class, 'events']);
    Route::get('/attempts/{attempt:uuid}/audits', [AttemptSubmissionController::class, 'audits']);

});
