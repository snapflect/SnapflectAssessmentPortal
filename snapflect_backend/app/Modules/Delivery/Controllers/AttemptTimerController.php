<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Modules\Delivery\Resources\TimerStatusResource;
use App\Modules\Delivery\Services\ResumeEngineService;
use App\Modules\Delivery\Context\TenantContextResolver;
use App\Modules\Delivery\DTOs\ResumeDto;
use Illuminate\Http\JsonResponse;

class AttemptTimerController extends Controller
{
    public function __construct(
        private readonly ResumeEngineService $resumeService,
        private readonly TenantContextResolver $contextResolver
    ) {
    }

    public function __invoke(Request $request, string $attempt_uuid): JsonResponse
    {
        $context = $this->contextResolver->resolve($request);
        
        $dto = new ResumeDto($attempt_uuid);
        
        $result = $this->resumeService->resumeAttempt(
            $dto, 
            $context->organizationId, 
            $context->userId
        );

        // We leverage Resume Engine to get timer status DTO without repeating logic
        return response()->json(new TimerStatusResource($result), 200);
    }
}
