<?php

declare(strict_types=1);

use Illuminate\\Support\\Facades\\Route;
use App\\Modules\\Assessment\\Controllers\\AssessmentCategoryController;
use App\\Modules\\Assessment\\Controllers\\AssessmentTypeController;
use App\\Modules\\Assessment\\Controllers\\AssessmentController;
use App\\Modules\\Assessment\\Controllers\\QuestionBankController;
use App\\Modules\\Assessment\\Controllers\\QuestionController;
use App\\Modules\\Assessment\\Controllers\\CompetencyGroupController;
use App\\Modules\\Assessment\\Controllers\\CompetencyController;
use App\\Modules\\Assessment\\Controllers\\BlueprintController;
use App\\Modules\\Assessment\\Controllers\\VersionController;
use App\\Modules\\Assessment\\Controllers\\PublicationController;

/*
|--------------------------------------------------------------------------
| Assessment Module API Routes
|--------------------------------------------------------------------------
|
| Prefix: /api/v1/assessment
| Middleware: auth:sanctum, throttle:api (Applied in api.php)
|
*/

// Categories
Route::apiResource('categories', AssessmentCategoryController::class)
    ->parameters(['categories' => 'uuid']);

// Types
Route::apiResource('types', AssessmentTypeController::class)
    ->parameters(['types' => 'uuid']);

// Assessments (Core)
Route::apiResource('assessments', AssessmentController::class)
    ->parameters(['assessments' => 'uuid']);

// Special Assessment Routes
Route::prefix('assessments/{uuid}')->group(function () {
    Route::post('submit-review', [AssessmentController::class, 'submitReview']);
    Route::post('approve', [AssessmentController::class, 'approve']);
    Route::post('reject', [AssessmentController::class, 'reject']);
    Route::post('publish', [AssessmentController::class, 'publish']);
    Route::post('archive', [AssessmentController::class, 'archive']);
    Route::post('clone', [AssessmentController::class, 'clone']);
    
    // Versions nested under Assessment
    Route::get('versions', [VersionController::class, 'index']);
});

// Question Banks
Route::apiResource('question-banks', QuestionBankController::class)
    ->parameters(['question-banks' => 'uuid']);

// Questions
Route::apiResource('questions', QuestionController::class)
    ->parameters(['questions' => 'uuid']);

// Competency Groups
Route::apiResource('competency-groups', CompetencyGroupController::class)
    ->parameters(['competency-groups' => 'uuid']);

// Competencies
Route::apiResource('competencies', CompetencyController::class)
    ->parameters(['competencies' => 'uuid']);

// Blueprints (Core mapping)
Route::apiResource('blueprints', BlueprintController::class)
    ->parameters(['blueprints' => 'uuid'])
    ->only(['show', 'store', 'update', 'destroy']);

// Blueprint Special Routing
Route::prefix('blueprints/{uuid}')->group(function () {
    Route::post('sections', [BlueprintController::class, 'createSection']);
});

Route::prefix('sections/{uuid}')->group(function () {
    Route::put('/', [BlueprintController::class, 'updateSection']);
    Route::post('rules', [BlueprintController::class, 'createRule']);
    Route::post('questions', [BlueprintController::class, 'assignQuestions']);
});

Route::put('rules/{uuid}', [BlueprintController::class, 'updateRule']);

// Versions
Route::prefix('versions/{uuid}')->group(function () {
    Route::get('/', [VersionController::class, 'show']);
    Route::get('history', [VersionController::class, 'history']);
});

// Publications
Route::get('publications', [PublicationController::class, 'index']);
Route::get('publications/{uuid}', [PublicationController::class, 'show']);
