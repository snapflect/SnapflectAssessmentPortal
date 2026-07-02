<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\DTOs\ValidationResultDto;
use App\Modules\Assessment\DTOs\ValidationErrorDto;
use Carbon\Carbon;

class AssessmentValidationService
{
    public function __construct(
        private readonly AssessmentRepositoryInterface $assessmentRepository
    ) {
    }

    public function validate(string $assessmentUuid, int $organizationId, int $userId): ValidationResultDto
    {
        $errors = [];

        // Tenant Safety & Efficient Eager Loading using Aggregates
        $assessment = $this->assessmentRepository->query()
            ->where('uuid', $assessmentUuid)
            ->where('organization_id', $organizationId)
            ->with([
                'blueprint',
                'blueprint.sections',
                'blueprint.sections.sectionQuestions.question' => function ($query) {
                    $query->withCount([
                        'options as correct_options_count' => function ($q) {
                            $q->where('is_correct', true);
                        },
                        'competencies'
                    ]);
                }
            ])
            ->first();

        if (!$assessment) {
            $errors[] = new ValidationErrorDto('RULE-AV-000', 'Assessment not found or cross-tenant access denied');
            return new ValidationResultDto($assessmentUuid, false, false, $errors, Carbon::now()->toIso8601String());
        }

        // RULE-AV-001: Assessment Title Required
        if (empty(trim((string)$assessment->assessment_name))) {
            $errors[] = new ValidationErrorDto('RULE-AV-001', 'Assessment title is required');
        }

        // RULE-AV-002: Assessment Duration Required
        if (empty($assessment->estimated_duration_minutes) || $assessment->estimated_duration_minutes <= 0) {
            $errors[] = new ValidationErrorDto('RULE-AV-002', 'Assessment estimated duration must be greater than zero');
        }

        $blueprint = $assessment->blueprint;

        // RULE-AV-003: Assessment Must Have At Least One Section
        if (!$blueprint || !$blueprint->sections || $blueprint->sections->isEmpty()) {
            $errors[] = new ValidationErrorDto('RULE-AV-003', 'Assessment must have at least one blueprint section');
        } else {
            // RULE-AV-006: Blueprint Weight Total Must Equal 100
            $totalWeight = $blueprint->sections->sum('section_weight');
            if (abs($totalWeight - 100.0) > 0.01) {
                $errors[] = new ValidationErrorDto('RULE-AV-006', 'Blueprint weight total must equal 100');
            }

            $questionUuids = [];

            foreach ($blueprint->sections as $section) {
                // RULE-AV-007: No Empty Sections Allowed
                if (!$section->sectionQuestions || $section->sectionQuestions->isEmpty()) {
                    $errors[] = new ValidationErrorDto('RULE-AV-007', sprintf('Section "%s" contains no questions', $section->section_name ?? 'Unknown'));
                }

                if ($section->sectionQuestions) {
                    foreach ($section->sectionQuestions as $sectionQuestion) {
                        $question = $sectionQuestion->question;
                        if (!$question) {
                            continue;
                        }

                        $questionUuids[] = $question->uuid;

                        // RULE-AV-004: Question Must Have Correct Answer (Auto-scored only)
                        if (QuestionScoringTypeResolver::isAutoScored((string)$question->question_type)) {
                            if ($question->correct_options_count === 0) {
                                $errors[] = new ValidationErrorDto('RULE-AV-004', sprintf('Auto-scored question "%s" must have a correct answer', $question->uuid));
                            }
                        }

                        // RULE-AV-005: Question Must Have Competency Mapping
                        if ($question->competencies_count === 0) {
                            $errors[] = new ValidationErrorDto('RULE-AV-005', sprintf('Question "%s" missing competency mapping', $question->uuid));
                        }
                    }
                }
            }

            // RULE-AV-008: Question Cannot Be Assigned Multiple Times
            $duplicates = array_unique(array_diff_assoc($questionUuids, array_unique($questionUuids)));
            if (!empty($duplicates)) {
                $errors[] = new ValidationErrorDto('RULE-AV-008', 'One or more questions are assigned multiple times within the blueprint');
            }
        }

        // RULE-AV-009: Assessment Must Validate Before Publication
        $isValid = count($errors) === 0;
        $readyForPublication = $isValid;

        return new ValidationResultDto(
            $assessmentUuid,
            $isValid,
            $readyForPublication,
            $errors,
            Carbon::now()->toIso8601String()
        );
    }
}
