<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

App\Http\Controllers\Controller;\nIlluminate\Http\JsonResponse;\nIlluminate\Http\Request;\nApp\Modules\Delivery\Models\AssessmentAttempt;\nApp\Modules\Delivery\Models\CandidateAnswer;\nApp\Modules\Delivery\Services\CandidateAnswerService;\nApp\Modules\Delivery\Requests\CreateAnswerRequest;\nApp\Modules\Delivery\Requests\UpdateAnswerRequest;\nApp\Modules\Delivery\Requests\AutoSaveAnswerRequest;\nApp\Modules\Delivery\Resources\CandidateAnswerResource;

class CandidateAnswerController extends Controller
{
    public function __construct(
        private readonly CandidateAnswerService $answerService
    ) {}

    public function store(CreateAnswerRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('create', $attempt);

        $answerData = $this->answerService->createAnswer($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Answer created successfully.',
            'data' => $answerData
        ]);
    }

    public function update(UpdateAnswerRequest $request, CandidateAnswer $answer): JsonResponse
    {
        $this->authorize('update', $answer);

        $answerData = $this->answerService->updateAnswer($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Answer updated successfully.',
            'data' => $answerData
        ]);
    }

    public function autoSave(AutoSaveAnswerRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('autoSave', $attempt);

        $this->answerService->autoSaveAnswer($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Answer auto-saved successfully.',
            'data' => null
        ]);
    }

    public function show(Request $request, CandidateAnswer $answer): JsonResponse
    {
        $this->authorize('view', $answer);

        return response()->json([
            'success' => true,
            'message' => 'Answer retrieved successfully.',
            'data' => new CandidateAnswerResource($answer)
        ]);
    }
}
