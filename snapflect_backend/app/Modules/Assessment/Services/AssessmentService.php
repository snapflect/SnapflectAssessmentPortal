<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateAssessmentDto;
use App\Modules\Assessment\DTOs\UpdateAssessmentDto;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepository; // generic category/type
use App\Modules\Assessment\Services\PublicationStateMachine;
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    private AssessmentRepositoryInterface $assessmentRepo;
    private \App\Modules\Assessment\Repositories\Interfaces\AssessmentCategoryRepositoryInterface $categoryRepo;
    private \App\Modules\Assessment\Repositories\Interfaces\AssessmentTypeRepositoryInterface $typeRepo;

    public function __construct(
        AssessmentRepositoryInterface $assessmentRepo,
        \App\Modules\Assessment\Repositories\Interfaces\AssessmentCategoryRepositoryInterface $categoryRepo,
        \App\Modules\Assessment\Repositories\Interfaces\AssessmentTypeRepositoryInterface $typeRepo,
        private \App\Modules\Assessment\Services\AssessmentValidationService $validationService
    ) {
        $this->assessmentRepo = $assessmentRepo;
        $this->categoryRepo = $categoryRepo;
        $this->typeRepo = $typeRepo;
    }

    public function createAssessment(int $organizationId, CreateAssessmentDto $dto): array
    {
        return DB::transaction(function () use ($organizationId, $dto) {
            $data = $dto->toArray();
            if (empty($data['assessment_code'])) {
                $baseCode = \Illuminate\Support\Str::slug($data['assessment_name']);
                $code = $baseCode;
                $counter = 1;
                while (\App\Modules\Assessment\Models\Assessment::where('assessment_code', $code)->whereNull('deleted_date')->exists()) {
                    $code = $baseCode . '-' . $counter;
                    $counter++;
                }
                $data['assessment_code'] = $code;
            }
            $data['organization_id'] = $organizationId;
            $data['current_state'] = PublicationStateMachine::STATE_DRAFT;
            $data['uuid'] = (string) \Illuminate\Support\Str::uuid();
            $data['created_by'] = auth()->id();
            
            $category = $this->categoryRepo->findByUuid($dto->assessment_category_uuid);
            if (!$category) {
                throw new \Exception('Assessment Category not found.');
            }
            $data['assessment_category_id'] = $category->id;
            
            $type = $this->typeRepo->findByUuid($dto->assessment_type_uuid);
            if (!$type) {
                throw new \Exception('Assessment Type not found.');
            }
            $data['assessment_type_id'] = $type->id;

            $assessment = $this->assessmentRepo->create($data);

            // Auto-generate a blueprint for this new assessment
            \App\Modules\Assessment\Models\AssessmentBlueprint::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'organization_id' => $organizationId,
                'assessment_id' => $assessment->id,
                'blueprint_name' => $assessment->assessment_name . ' Blueprint',
                'description' => 'Auto-generated blueprint for ' . $assessment->assessment_name,
                'status' => 'ACTIVE',
                'created_by' => auth()->id()
            ]);

            return $assessment->toArray();
        });
    }

    public function updateAssessment(int $id, UpdateAssessmentDto $dto): bool
    {
        return DB::transaction(function () use ($id, $dto) {
            $assessment = $this->assessmentRepo->findById($id);
            if (!PublicationStateMachine::isMutable($assessment->current_state)) {
                throw new \Exception("Cannot update an assessment in its current state.");
            }
            
            $data = $dto->toArray();
            $data['modified_by'] = auth()->id();
            
            if (isset($data['assessment_category_uuid'])) {
                $category = $this->categoryRepo->findByUuid($data['assessment_category_uuid']);
                if (!$category) {
                    throw new \Exception('Assessment Category not found.');
                }
                $data['assessment_category_id'] = $category->id;
                unset($data['assessment_category_uuid']);
            }
            
            if (isset($data['assessment_type_uuid'])) {
                $type = $this->typeRepo->findByUuid($data['assessment_type_uuid']);
                if (!$type) {
                    throw new \Exception('Assessment Type not found.');
                }
                $data['assessment_type_id'] = $type->id;
                unset($data['assessment_type_uuid']);
            }
            
            return $this->assessmentRepo->update($id, $data);
        });
    }

    public function deleteAssessment(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state === PublicationStateMachine::STATE_PUBLISHED) {
                throw new \Exception("Cannot delete a published assessment.");
            }
            return $this->assessmentRepo->delete($id);
        });
    }

    public function submitForReview(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state !== PublicationStateMachine::STATE_DRAFT) {
                throw new \Exception("Only DRAFT assessments can be submitted for review.");
            }
            
            $validationResult = $this->validationService->validate($assessment->uuid, $assessment->organization_id, auth()->id());
            if (!$validationResult->readyForPublication) {
                $errorMessages = array_map(fn($e) => $e->message, $validationResult->validationErrors);
                throw new \App\Modules\Assessment\Exceptions\AssessmentPublicationException(
                    \App\Modules\Assessment\Exceptions\AssessmentPublicationException::ASSESSMENT_NOT_READY, 
                    "Assessment validation failed. Please fix the following errors before submitting: \n" . implode("\n", $errorMessages), 
                    $validationResult->validationErrors
                );
            }
            
            return $this->assessmentRepo->update($id, ['current_state' => PublicationStateMachine::STATE_IN_REVIEW]);
        });
    }

    public function approveAssessment(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state !== PublicationStateMachine::STATE_IN_REVIEW) {
                throw new \Exception("Only IN_REVIEW assessments can be approved.");
            }
            return $this->assessmentRepo->update($id, ['current_state' => PublicationStateMachine::STATE_APPROVED]);
        });
    }

    public function rejectAssessment(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state !== PublicationStateMachine::STATE_IN_REVIEW) {
                throw new \Exception("Only IN_REVIEW assessments can be rejected.");
            }
            return $this->assessmentRepo->update($id, ['current_state' => PublicationStateMachine::STATE_DRAFT]);
        });
    }

    public function archive(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $assessment = $this->assessmentRepo->findById($id);
            if ($assessment->current_state !== PublicationStateMachine::STATE_PUBLISHED) {
                throw new \Exception("Only PUBLISHED assessments can be archived.");
            }
            return $this->assessmentRepo->update($id, ['current_state' => PublicationStateMachine::STATE_ARCHIVED]);
        });
    }
}
