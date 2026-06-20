<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

App\Http\Controllers\Controller;\nIlluminate\Http\JsonResponse;\nIlluminate\Http\Request;\nApp\Modules\Delivery\Models\AssessmentAttempt;\nApp\Modules\Delivery\Models\AttemptQuestion;\nApp\Modules\Delivery\Services\AttemptQuestionService;\nApp\Modules\Delivery\Services\CandidateAnswerService;\nApp\Modules\Delivery\Requests\NavigateQuestionRequest;\nApp\Modules\Delivery\Requests\FlagQuestionRequest;\nApp\Modules\Delivery\Requests\UnflagQuestionRequest;\nApp\Modules\Delivery\DTOs\LoadAttemptQuestionsDto;\nApp\Modules\Delivery\Resources\AttemptQuestionResource;

class AttemptQuestionController extends Controller
{
    public function __construct(
        private readonly AttemptQuestionService $questionService,
        private readonly CandidateAnswerService $answerService
    ) {}

    public function index(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $dto = new LoadAttemptQuestionsDto($attempt->uuid, $request->input('section_uuid'));
        $questions = $this->questionService->loadQuestions($dto);

        return response()->json([
            'success' => true,
            'message' => 'Attempt questions retrieved successfully.',
            'data' => $questions
        ]);
    }

    public function show(Request $request, AttemptQuestion $question): JsonResponse
    {
        $this->authorize('view', $question);

        $questionData = $this->questionService->loadQuestion($question->uuid);

        return response()->json([
            'success' => true,
            'message' => 'Attempt question retrieved successfully.',
            'data' => $questionData
        ]);
    }

    public function next(NavigateQuestionRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $questionData = $this->questionService->nextQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Navigated to next question successfully.',
            'data' => $questionData
        ]);
    }

    public function previous(NavigateQuestionRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $questionData = $this->questionService->previousQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Navigated to previous question successfully.',
            'data' => $questionData
        ]);
    }

    public function jump(NavigateQuestionRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $questionData = $this->questionService->jumpToQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Jumped to question successfully.',
            'data' => $questionData
        ]);
    }

    public function flag(FlagQuestionRequest $request, AttemptQuestion $question): JsonResponse
    {
        $this->authorize('flag', $question);

        $this->answerService->flagQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Question flagged successfully.',
            'data' => null
        ]);
    }

    public function unflag(UnflagQuestionRequest $request, AttemptQuestion $question): JsonResponse
    {
        $this->authorize('unflag', $question);

        $this->answerService->unflagQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Question unflagged successfully.',
            'data' => null
        ]);
    }
}
