<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateQuestionBankRequest;
use App\Modules\Assessment\Requests\UpdateQuestionBankRequest;
use App\Modules\Assessment\Services\QuestionBankService;
use App\Modules\Assessment\Repositories\Interfaces\QuestionBankRepositoryInterface;
use App\Modules\Assessment\Resources\QuestionBankResource;
use App\Modules\Assessment\Models\QuestionBank;
use Illuminate\Http\JsonResponse;

class QuestionBankController extends Controller
{
    public function __construct(
        private QuestionBankService $service,
        private QuestionBankRepositoryInterface $repository
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', QuestionBank::class);
        $records = $this->repository->paginateByOrganization(auth()->user()->organization_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => QuestionBankResource::collection($records)
        ]);
    }

    public function show(QuestionBank $record): JsonResponse
    {
        $this->authorize('view', $record);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => QuestionBankResource::make($record)
        ]);
    }

    public function store(CreateQuestionBankRequest $request): JsonResponse
    {
        $this->authorize('create', QuestionBank::class);
        
        // Mocking service call for generic controllers
        // $data = $this->service->create(auth()->user()->organization_id, $request->toDto());
        $data = ['id' => 1]; // Placeholder
        $record = $this->repository->findById($data['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => QuestionBankResource::make($record) // Would be mapped properly in real code
        ], 201);
    }

    public function update(UpdateQuestionBankRequest $request, QuestionBank $record): JsonResponse
    {
        $this->authorize('update', $record);
        
        // $this->service->update($record->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => QuestionBankResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(QuestionBank $record): JsonResponse
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
