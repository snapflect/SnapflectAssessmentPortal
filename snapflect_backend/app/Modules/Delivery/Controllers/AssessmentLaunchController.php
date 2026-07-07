<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Delivery\Requests\LaunchAttemptRequest;
use App\Modules\Delivery\Resources\LaunchAttemptResource;
use App\Modules\Delivery\Services\SessionLaunchService;
use App\Modules\Delivery\Context\TenantContextResolver;
use App\Modules\Delivery\DTOs\SessionLaunchDto;
use Illuminate\Http\JsonResponse;

class AssessmentLaunchController extends Controller
{
    public function __construct(
        private readonly SessionLaunchService $launchService,
        private readonly TenantContextResolver $contextResolver
    ) {
    }

    public function __invoke(LaunchAttemptRequest $request, string $assessment_uuid): JsonResponse
    {
        $context = $this->contextResolver->resolve($request);
        
        $sessionDto = $this->launchService->createSession(
            $assessment_uuid,
            $context->userId,
            $context->organizationId,
            $context->userId
        );
        
        $result = $this->launchService->launchSession(
            $sessionDto->sessionUuid, 
            $context->organizationId, 
            $context->userId
        );

        return response()->json(new LaunchAttemptResource($result), 201);
    }
}
