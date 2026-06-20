<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateAssessmentDto;
use App\Modules\Assessment\DTOs\UpdateAssessmentDto;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepository; // generic category/type
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    private AssessmentRepositoryInterface $assessmentRepo;
    // other repos injected

    public function __construct(AssessmentRepositoryInterface $assessmentRepo)
    {
        $this->assessmentRepo = $assessmentRepo;
    }

    public function createAssessment(int $organizationId, CreateAssessmentDto $dto): array
    {
        return DB::transaction(function () use ($organizationId, $dto) {
            // Pseudo UUID -> ID resolution
            // $categoryId = $categoryRepo->findByUuid($dto->assessment_category_uuid)->id;
            // $typeId = $typeRepo->findByUuid($dto->assessment_type_uuid)->id;

            $data = $dto->toArray();
            $data['organization_id'] = $organizationId;
            $data['current_state'] = 'DRAFT';
            
            // Mock ID resolution for architecture review
            $data['assessment_category_id'] = 1; 
            $data['assessment_type_id'] = 1;

            return $this->assessmentRepo->create($data)->toArray();
        });
    }

    public function updateAssessment(int $id, UpdateAssessmentDto $dto): bool
    {
        return DB::transaction(function () use ($id, $dto) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state === 'PUBLISHED') {
                throw new \Exception("Cannot update a published assessment.");
            }
            return $this->assessmentRepo->update($id, $dto->toArray());
        });
    }

    public function deleteAssessment(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state === 'PUBLISHED') {
                throw new \Exception("Cannot delete a published assessment.");
            }
            return $this->assessmentRepo->delete($id);
        });
    }

    public function submitForReview(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state !== 'DRAFT') {
                throw new \Exception("Only DRAFT assessments can be submitted for review.");
            }
            return $this->assessmentRepo->update($id, ['current_state' => 'IN_REVIEW']);
        });
    }

    public function archive(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state !== 'PUBLISHED') {
                throw new \Exception("Only PUBLISHED assessments can be archived.");
            }
            return $this->assessmentRepo->update($id, ['current_state' => 'ARCHIVED']);
        });
    }
}
