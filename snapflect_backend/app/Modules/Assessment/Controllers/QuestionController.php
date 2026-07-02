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
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct(
        private QuestionService $service,
        private QuestionRepositoryInterface $repository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Question::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        // Handle filter by Question Bank UUID
        $bankUuid = $request->query('question_bank_uuid');
        
        if ($request->user()->hasRole('PLATFORM_ADMIN') || $request->user()->hasRole('Platform Admin')) {
            if ($bankUuid) {
                // To do this via repository, we might need to add a custom search or just use builder
                // For now, let's use the repository's query builder
                $query = $this->repository->query()->with(['bank']);
                $query->whereHas('bank', function($q) use ($bankUuid) {
                    $q->where('uuid', $bankUuid);
                });
                
                if ($request->query('tag_uuid')) {
                    $tagUuid = $request->query('tag_uuid');
                    $query->whereHas('tags', function ($q) use ($tagUuid) {
                        $q->where('question_tags.uuid', $tagUuid);
                    });
                }
                
                $records = $query->paginate($perPage);
            } else {
                // If we want relations on paginate, we should update QuestionRepository::paginate
                $query = $this->repository->query()->with(['bank']);
                if ($request->query('tag_uuid')) {
                    $tagUuid = $request->query('tag_uuid');
                    $query->whereHas('tags', function ($q) use ($tagUuid) {
                        $q->where('question_tags.uuid', $tagUuid);
                    });
                }
                $records = $query->paginate($perPage);
            }
        } else {
            $organizationId = $request->user()->organization_id;
            $query = $this->repository->query()->with(['bank']);
            
            // Allow them to see questions from their own org, OR from global banks
            $query->where(function($q) use ($organizationId) {
                $q->where('organization_id', $organizationId)
                  ->orWhereHas('bank', function($subQ) {
                      $subQ->where('is_system_bank', true);
                  });
            });
            
            if ($bankUuid) {
                $query->whereHas('bank', function($q) use ($bankUuid) {
                    $q->where('uuid', $bankUuid);
                });
            }
            
            if ($request->query('tag_uuid')) {
                $tagUuid = $request->query('tag_uuid');
                $query->whereHas('tags', function ($q) use ($tagUuid) {
                    $q->where('question_tags.uuid', $tagUuid);
                });
            }
            
            $records = $query->paginate($perPage);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => QuestionResource::collection($records)->resource
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $record = $this->repository->findByUuidWithRelations($uuid, ['bank', 'options']);
        if (!$record) {
            abort(404, 'Question not found');
        }
        
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
        
        $record = $this->service->createQuestion(
            $request->user()->organization_id ?? 0, 
            $request->toDto(),
            $request->user()->id
        );
        
        $record->load(['bank', 'options']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => QuestionResource::make($record)
        ], 201);
    }

    public function update(UpdateQuestionRequest $request, string $uuid): JsonResponse
    {
        $record = $this->repository->findByUuid($uuid);
        if (!$record) {
            abort(404, 'Question not found');
        }
        
        $this->authorize('update', $record);
        
        // Prevent clients from editing global questions
        if (!($request->user()->hasRole('PLATFORM_ADMIN') || $request->user()->hasRole('Platform Admin'))) {
            if ($record->organization_id !== $request->user()->organization_id) {
                abort(403, 'You cannot edit a global question. Please clone it first.');
            }
        }
        
        $this->service->updateQuestion($record->id, $request->toDto(), $request->user()->id);
        
        $updatedRecord = $this->repository->findByIdWithRelations($record->id, ['bank', 'options']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => QuestionResource::make($updatedRecord)
        ]);
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $record = $this->repository->findByUuid($uuid);
        if (!$record) {
            abort(404, 'Question not found');
        }
        
        $this->authorize('delete', $record);
        
        if (!($request->user()->hasRole('PLATFORM_ADMIN') || $request->user()->hasRole('Platform Admin'))) {
            if ($record->organization_id !== $request->user()->organization_id) {
                abort(403, 'You cannot delete a global question.');
            }
        }
        
        $this->service->deleteQuestion($record->id, $request->user()->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.',
            'data' => []
        ]);
    }
    
    public function clone(string $uuid, Request $request): JsonResponse
    {
        $request->validate([
            'target_question_bank_uuid' => ['required', 'uuid']
        ]);

        $record = $this->repository->findByUuidWithRelations($uuid, ['options']);
        if (!$record) {
            abort(404, 'Question not found');
        }
        
        $clonedRecord = $this->service->cloneQuestion(
            $record,
            $request->input('target_question_bank_uuid'),
            $request->user()->organization_id ?? 0,
            $request->user()->id
        );
        
        $clonedRecord->load(['bank', 'options']);
        
        return response()->json([
            'success' => true,
            'message' => 'Question cloned successfully.',
            'data' => QuestionResource::make($clonedRecord)
        ], 201);
    }

    public function countMatches(Request $request): JsonResponse
    {
        $query = Question::query()->where('status', 'ACTIVE');
        
        // Note: For multi-tenant, ensure org isolation if necessary
        // $query->where('organization_id', $request->user()->organization_id);

        if ($request->filled('difficulty_level')) {
            $query->where('difficulty_level', $request->difficulty_level);
        }

        if ($request->filled('question_type')) {
            $query->where('question_type', $request->question_type);
        }

        if ($request->filled('competency_uuid')) {
            $query->whereHas('competencies', function ($q) use ($request) {
                $q->where('competencies.uuid', $request->competency_uuid);
            });
        }

        if ($request->filled('tag_uuid')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('question_tags.uuid', $request->tag_uuid);
            });
        }

        $count = $query->count();

        return response()->json([
            'success' => true,
            'data' => [
                'available_count' => $count
            ]
        ]);
    }
}
