<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AttemptQuestion;
use App\Modules\Delivery\Services\AttemptQuestionService;
use App\Modules\Delivery\Services\CandidateAnswerService;
use App\Modules\Delivery\Requests\NavigateQuestionRequest;
use App\Modules\Delivery\Requests\FlagQuestionRequest;
use App\Modules\Delivery\Requests\UnflagQuestionRequest;
use App\Modules\Delivery\DTOs\LoadAttemptQuestionsDto;
use App\Modules\Delivery\Resources\AttemptQuestionResource;

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

    public function flag(FlagQuestionRequest $request, string $questionUuid): JsonResponse
    {
        $this->answerService->flagQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Question flagged successfully.',
            'data' => null
        ]);
    }

    public function unflag(UnflagQuestionRequest $request, string $questionUuid): JsonResponse
    {
        $this->answerService->unflagQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Question unflagged successfully.',
            'data' => null
        ]);
    }
}
