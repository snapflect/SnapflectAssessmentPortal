<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Delivery\Requests\AutoSaveRequest;
use App\Modules\Delivery\Resources\AutoSaveResource;
use App\Modules\Delivery\Services\AutoSaveService;
use App\Modules\Delivery\Context\TenantContextResolver;
use App\Modules\Delivery\DTOs\AutoSaveDto;
use Illuminate\Http\JsonResponse;

class AttemptAutoSaveController extends Controller
{
    public function __construct(
        private readonly AutoSaveService $autoSaveService,
        private readonly TenantContextResolver $contextResolver
    ) {
    }

    public function __invoke(AutoSaveRequest $request, string $attempt_uuid): JsonResponse
    {
        $context = $this->contextResolver->resolve($request);
        
        $data = $request->validated();
        
        $dto = new AutoSaveDto(
            $attempt_uuid,
            $data['questionUuid'],
            $data['answerPayload'] ?? null,
            (string)$data['clientDraftVersion']
        );
        
        $result = $this->autoSaveService->executeSave(
            $dto, 
            $context->organizationId, 
            $context->userId
        );

        return response()->json(new AutoSaveResource($result), 200);
    }
}
