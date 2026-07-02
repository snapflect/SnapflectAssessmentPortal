<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Services\CandidateAnswerService;
use App\Modules\Delivery\Requests\CreateAnswerRequest;
use App\Modules\Delivery\Requests\UpdateAnswerRequest;
use App\Modules\Delivery\Requests\AutoSaveAnswerRequest;
use App\Modules\Delivery\Resources\CandidateAnswerResource;

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
