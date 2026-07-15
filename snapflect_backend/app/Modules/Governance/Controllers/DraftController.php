<?php

namespace App\Modules\Governance\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Modules\Governance\Models\OrganizationDraft;

class DraftController extends Controller
{
    public function store(Request $request, string $entityType, string $entityId): JsonResponse
    {
        $payload = $request->input('payload');

        $draft = OrganizationDraft::updateOrCreate(
            ['entity_type' => $entityType, 'entity_id' => $entityId],
            [
                'payload' => $payload,
                'user_id' => auth()->id() ?? null
            ]
        );

        return response()->json(['message' => 'Draft saved successfully', 'draft' => $draft], 200);
    }

    public function show(string $entityType, string $entityId): JsonResponse
    {
        $draft = OrganizationDraft::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->first();

        if (!$draft) {
            return response()->json(null, 404);
        }

        return response()->json(['draft' => $draft], 200);
    }
}
