<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Delivery\Requests\SubmitAttemptRequest;
use App\Modules\Delivery\Resources\SubmissionResource;
use App\Modules\Delivery\Services\SubmissionEngineService;
use App\Modules\Delivery\Context\TenantContextResolver;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use Illuminate\Http\JsonResponse;

class AttemptSubmissionController extends Controller
{
    public function __construct(
        private readonly SubmissionEngineService $submissionService,
        private readonly TenantContextResolver $contextResolver
    ) {
    }

    public function __invoke(SubmitAttemptRequest $request, string $attempt_uuid): JsonResponse
    {
        $context = $this->contextResolver->resolve($request);
        
        $dto = new SubmitAttemptDto($attempt_uuid);
        
        $result = $this->submissionService->submitAttempt(
            $dto, 
            $context->organizationId, 
            $context->userId
        );

        return response()->json(new SubmissionResource($result), 200);
    }
}
