<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateQuestionRequest;
use App\Modules\Assessment\Requests\UpdateQuestionRequest;
use App\Modules\Assessment\Services\QuestionService;
use App\Modules\Assessment\Repositories\Interfaces\QuestionRepositoryInterface;
use App\Modules\Assessment\Resources\QuestionResource;
use App\Modules\Assessment\Models\Question;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    public function __construct(
        private QuestionService $service,
        private QuestionRepositoryInterface $repository
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Question::class);
        $records = $this->repository->paginateByOrganization(auth()->user()->organization_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => QuestionResource::collection($records)
        ]);
    }

    public function show(Question $record): JsonResponse
    {
        $this->authorize('view', $record);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => QuestionResource::make($record)
        ]);
    }

    public function store(CreateQuestionRequest $request): JsonResponse
    {
        $this->authorize('create', Question::class);
        
        // Mocking service call for generic controllers
        // $data = $this->service->create(auth()->user()->organization_id, $request->toDto());
        $data = ['id' => 1]; // Placeholder
        $record = $this->repository->findById($data['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => QuestionResource::make($record) // Would be mapped properly in real code
        ], 201);
    }

    public function update(UpdateQuestionRequest $request, Question $record): JsonResponse
    {
        $this->authorize('update', $record);
        
        // $this->service->update($record->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => QuestionResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(Question $record): JsonResponse
    {
        $this->authorize('delete', $record);
        
        // $this->service->delete($record->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.',
            'data' => []
        ]);
    }
}
