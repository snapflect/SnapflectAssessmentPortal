const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'snapflect', 'routes', 'modules');
if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
}

const writePhpFile = (filename, content) => {
    fs.writeFileSync(path.join(routesDir, filename), content);
};

const routeContent = `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Modules\\Delivery\\Controllers\\AssessmentSessionController;
use App\\Modules\\Delivery\\Controllers\\AssessmentAttemptController;
use App\\Modules\\Delivery\\Controllers\\AttemptQuestionController;
use App\\Modules\\Delivery\\Controllers\\CandidateAnswerController;
use App\\Modules\\Delivery\\Controllers\\AttemptSubmissionController;

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Session Routes
    Route::post('/sessions/launch', [AssessmentSessionController::class, 'launch']);
    Route::post('/sessions/{session:uuid}/resume', [AssessmentSessionController::class, 'resume']);
    Route::post('/sessions/{session:uuid}/terminate', [AssessmentSessionController::class, 'terminate']);
    Route::get('/sessions/{session:uuid}', [AssessmentSessionController::class, 'show']);

    // Attempt Routes
    Route::get('/attempts/{attempt:uuid}', [AssessmentAttemptController::class, 'show']);
    Route::get('/attempts/{attempt:uuid}/progress', [AssessmentAttemptController::class, 'progress']);
    Route::post('/attempts/{attempt:uuid}/submit', [AssessmentAttemptController::class, 'submit']);
    Route::post('/attempts/{attempt:uuid}/expire', [AssessmentAttemptController::class, 'expire']);

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

    // Answer Routes
    // Note: 'store' and 'autoSave' methods expect an attempt in the URL for RMB, or they fetch from payload.
    // Given the URI map doesn't include {attempt} in POST /answers, the controller might fail if it typehints AssessmentAttempt $attempt but route doesn't have it.
    // However, the rule states to generate routes exactly as provided. We'll map them strictly.
    Route::post('/answers', [CandidateAnswerController::class, 'store']);
    Route::put('/answers/{answer:uuid}', [CandidateAnswerController::class, 'update']);
    Route::post('/answers/auto-save', [CandidateAnswerController::class, 'autoSave']);
    Route::get('/answers/{answer:uuid}', [CandidateAnswerController::class, 'show']);

    // Submission Routes
    Route::get('/submissions/{submission:uuid}', [AttemptSubmissionController::class, 'show']);
    Route::get('/attempts/{attempt:uuid}/events', [AttemptSubmissionController::class, 'events']);
    Route::get('/attempts/{attempt:uuid}/audits', [AttemptSubmissionController::class, 'audits']);

});
`;

writePhpFile('delivery.php', routeContent);

// Update api.php
const apiPhpPath = path.join(__dirname, 'snapflect', 'routes', 'api.php');
let apiContent = fs.readFileSync(apiPhpPath, 'utf8');

// Ensure /api/v1/delivery is registered
if (!apiContent.includes("prefix('delivery')")) {
    const deliveryGroup = `
    // Delivery Engine Routes
    Route::prefix('delivery')->group(base_path('routes/modules/delivery.php'));
`;

    // Try to inject it inside the v1 group. Find Route::prefix('v1')->group(function () {
    if (apiContent.includes("Route::prefix('v1')->group(function () {")) {
        apiContent = apiContent.replace(
            "Route::prefix('v1')->group(function () {",
            "Route::prefix('v1')->group(function () {\\n" + deliveryGroup
        );
        fs.writeFileSync(apiPhpPath, apiContent);
        console.log('Registered delivery.php in api.php.');
    } else {
        console.warn('Could not find v1 prefix group in api.php to register delivery routes.');
    }
} else {
    console.log('delivery.php is already registered in api.php.');
}

console.log('Sprint 03 Routes generated.');
