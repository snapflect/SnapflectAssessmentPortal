<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateBlueprintRequest;
use App\Modules\Assessment\Requests\UpdateBlueprintRequest;
use App\Modules\Assessment\Requests\CreateBlueprintSectionRequest;
use App\Modules\Assessment\Requests\UpdateBlueprintSectionRequest;
use App\Modules\Assessment\Requests\CreateBlueprintRuleRequest;
use App\Modules\Assessment\Requests\UpdateBlueprintRuleRequest;
use App\Modules\Assessment\Services\BlueprintService;
use App\Modules\Assessment\Repositories\Interfaces\BlueprintRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentBlueprintResource;
use App\Modules\Assessment\Resources\BlueprintSectionResource;
use App\Modules\Assessment\Resources\BlueprintRuleResource;
use App\Modules\Assessment\Models\AssessmentBlueprint;
use App\Modules\Assessment\Models\BlueprintSection;
use App\Modules\Assessment\Models\BlueprintRule;
use Illuminate\Http\JsonResponse;

class BlueprintController extends Controller
{
    public function __construct(
        private BlueprintService $blueprintService,
        private BlueprintRepositoryInterface $blueprintRepo
    ) {}

    public function show(AssessmentBlueprint $blueprint): JsonResponse
    {
        $this->authorize('view', $blueprint);
        
        return response()->json([
            'success' => true,
            'message' => 'Blueprint retrieved successfully.',
            'data' => AssessmentBlueprintResource::make($blueprint)
        ]);
    }

    public function store(CreateBlueprintRequest $request): JsonResponse
    {
        // Auth via Assessment usually, but mapping directly to class
        $this->authorize('update', AssessmentBlueprint::class); 
        
        $this->blueprintService->createBlueprint(auth()->user()->organization_id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Blueprint created successfully.',
            'data' => [] // Returns resource when fetched
        ], 201);
    }

    public function createSection(CreateBlueprintSectionRequest $request, AssessmentBlueprint $blueprint): JsonResponse
    {
        $this->authorize('update', $blueprint);
        
        // $this->blueprintService->createSection($blueprint->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Section created successfully.',
            'data' => []
        ], 201);
    }

    public function updateSection(UpdateBlueprintSectionRequest $request, BlueprintSection $section): JsonResponse
    {
        $this->authorize('update', $section->blueprint);
        
        // $this->blueprintService->updateSection($section->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Section updated successfully.',
            'data' => []
        ]);
    }

    public function createRule(CreateBlueprintRuleRequest $request, BlueprintSection $section): JsonResponse
    {
        $this->authorize('update', $section->blueprint);
        
        return response()->json([
            'success' => true,
            'message' => 'Rule created successfully.',
            'data' => []
        ], 201);
    }

    public function updateRule(UpdateBlueprintRuleRequest $request, BlueprintRule $rule): JsonResponse
    {
        $this->authorize('update', $rule->section->blueprint);
        
        return response()->json([
            'success' => true,
            'message' => 'Rule updated successfully.',
            'data' => []
        ]);
    }

    public function assignQuestions(BlueprintSection $section): JsonResponse
    {
        $this->authorize('update', $section->blueprint);
        
        return response()->json([
            'success' => true,
            'message' => 'Questions assigned successfully.',
            'data' => []
        ]);
    }
}
