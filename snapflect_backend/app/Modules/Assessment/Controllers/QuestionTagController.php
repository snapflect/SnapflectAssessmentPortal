<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Models\QuestionTag;
use App\Modules\Assessment\Resources\QuestionTagResource;
use Illuminate\Http\JsonResponse;

class QuestionTagController extends Controller
{
    public function index(): JsonResponse
    {
        // For the dropdown, just return all active tags
        $tags = QuestionTag::where('status', 'ACTIVE')->orderBy('tag_name')->get();
        
        return response()->json([
            'success' => true,
            'data' => QuestionTagResource::collection($tags)
        ]);
    }

    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tag_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:ACTIVE,INACTIVE'
        ]);

        $tag = QuestionTag::create([
            'organization_id' => $request->user()->organization_id ?? 1,
            'tag_name' => $validated['tag_name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'ACTIVE'
        ]);

        return response()->json([
            'success' => true,
            'data' => new QuestionTagResource($tag)
        ], 201);
    }

    public function update(\Illuminate\Http\Request $request, QuestionTag $tag): JsonResponse
    {
        $validated = $request->validate([
            'tag_name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:ACTIVE,INACTIVE'
        ]);

        $tag->update($validated);

        return response()->json([
            'success' => true,
            'data' => new QuestionTagResource($tag)
        ]);
    }

    public function destroy(QuestionTag $tag): JsonResponse
    {
        $tag->update(['status' => 'INACTIVE']);

        return response()->json([
            'success' => true,
            'message' => 'Tag deactivated successfully'
        ]);
    }
}
