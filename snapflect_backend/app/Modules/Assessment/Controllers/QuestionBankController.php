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
        
        if (auth()->user()->hasRole(['Platform Admin', 'PLATFORM_ADMIN'])) {
            $records = $this->repository->query()->with(['organization'])->paginate();
        } else {
            $records = $this->repository->query()->with(['organization'])
                ->where('organization_id', auth()->user()->organization_id)
                ->paginate();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => QuestionBankResource::collection($records)
        ]);
    }

    public function show(QuestionBank $uuid): JsonResponse
    {
        $record = $uuid;
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
        
        $dto = $request->toDto();
        
        if (auth()->user()->hasRole('PLATFORM_ADMIN') || auth()->user()->hasRole('Platform Admin')) {
            $orgId = $dto->organization_id;
        } else {
            $orgId = auth()->user()->organization_id;
        }

        $record = $this->service->create($orgId, $dto, auth()->id());
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => QuestionBankResource::make($record)
        ], 201);
    }

    public function update(UpdateQuestionBankRequest $request, QuestionBank $uuid): JsonResponse
    {
        $record = $uuid;
        $this->authorize('update', $record);
        
        $dto = $request->toDto();
        $this->service->update($record->id, $dto, auth()->id());
        
        // Handle organization_id change if Platform Admin
        if (auth()->user()->hasRole('PLATFORM_ADMIN') || auth()->user()->hasRole('Platform Admin')) {
            if ($request->has('organization_id')) {
                $record->organization_id = $request->input('organization_id');
                $record->is_system_bank = is_null($record->organization_id);
                $record->save();
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => QuestionBankResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(QuestionBank $uuid): JsonResponse
    {
        $record = $uuid;
        $this->authorize('delete', $record);
        
        $this->service->delete($record->id, auth()->id());
        
        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.',
            'data' => []
        ]);
    }
}
