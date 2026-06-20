<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateBlueprintDto;
use App\Modules\Assessment\Repositories\Interfaces\BlueprintRepositoryInterface;
use Illuminate\Support\Facades\DB;

class BlueprintService
{
    private BlueprintRepositoryInterface $blueprintRepo;

    public function __construct(BlueprintRepositoryInterface $blueprintRepo)
    {
        $this->blueprintRepo = $blueprintRepo;
    }

    public function createBlueprint(int $organizationId, CreateBlueprintDto $dto)
    {
        return DB::transaction(function () use ($organizationId, $dto) {
            // Check Assessment State
            // $assessment = $assessmentRepo->findByUuid($dto->assessment_uuid);
            // if ($assessment->current_state === 'PUBLISHED') throw Error

            // 1. Create Blueprint
            // 2. Map deeply nested DTO array ($dto->sections)
            // foreach ($dto->sections as $sectionDto) { ... }
            
            return true;
        });
    }

    public function validateBlueprintWeights(int $blueprintId): bool
    {
        // Business Logic checking if section_weight sums to exactly 100
        return true;
    }
}
