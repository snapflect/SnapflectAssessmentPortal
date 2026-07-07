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

    public function createSection(int $blueprintId, \App\Modules\Assessment\DTOs\CreateBlueprintSectionDto $dto): \App\Modules\Assessment\Models\BlueprintSection
    {
        return DB::transaction(function () use ($blueprintId, $dto) {
            $section = \App\Modules\Assessment\Models\BlueprintSection::create([
                'blueprint_id' => $blueprintId,
                'section_name' => $dto->section_name,
                'description' => $dto->description,
                'display_order' => $dto->display_order,
                'section_duration_minutes' => $dto->section_duration_minutes,
                'section_weight' => $dto->section_weight,
                'selection_strategy' => $dto->selection_strategy ?? 'FIXED',
            ]);

            return $section;
        });
    }

    public function createRule(int $sectionId, \App\Modules\Assessment\DTOs\CreateBlueprintRuleDto $dto): \App\Modules\Assessment\Models\BlueprintRule
    {
        return DB::transaction(function () use ($sectionId, $dto) {
            $competencyId = null;
            if ($dto->competency_uuid) {
                $competencyId = DB::table('competencies')->where('uuid', $dto->competency_uuid)->value('id');
            }

            $tagId = null;
            if ($dto->tag_uuid) {
                $tagId = DB::table('question_tags')->where('uuid', $dto->tag_uuid)->value('id');
            }

            $rule = \App\Modules\Assessment\Models\BlueprintRule::create([
                'blueprint_section_id' => $sectionId,
                'difficulty_level' => $dto->difficulty_level,
                'competency_id' => $competencyId,
                'tag_id' => $tagId,
                'question_type' => $dto->question_type,
                'question_count' => $dto->question_count,
                'points_per_question' => $dto->points_per_question,
                'status' => 'ACTIVE'
            ]);

            return $rule;
        });
    }

    public function updateSection(int $sectionId, \App\Modules\Assessment\DTOs\UpdateBlueprintSectionDto $dto): \App\Modules\Assessment\Models\BlueprintSection
    {
        return DB::transaction(function () use ($sectionId, $dto) {
            $section = \App\Modules\Assessment\Models\BlueprintSection::findOrFail($sectionId);
            
            $updates = [];
            if ($dto->section_name !== null) $updates['section_name'] = $dto->section_name;
            if (isset($dto->description)) $updates['description'] = $dto->description;
            if ($dto->display_order !== null) $updates['display_order'] = $dto->display_order;
            if ($dto->section_duration_minutes !== null) $updates['section_duration_minutes'] = $dto->section_duration_minutes;
            if ($dto->section_weight !== null) $updates['section_weight'] = $dto->section_weight;
            if ($dto->selection_strategy !== null) $updates['selection_strategy'] = $dto->selection_strategy;

            if (!empty($updates)) {
                $section->update($updates);
            }
            return $section;
        });
    }

    public function updateRule(int $ruleId, \App\Modules\Assessment\DTOs\UpdateBlueprintRuleDto $dto): \App\Modules\Assessment\Models\BlueprintRule
    {
        return DB::transaction(function () use ($ruleId, $dto) {
            $rule = \App\Modules\Assessment\Models\BlueprintRule::findOrFail($ruleId);
            
            $updates = [];
            if ($dto->difficulty_level !== null) $updates['difficulty_level'] = $dto->difficulty_level;
            if ($dto->question_type !== null) $updates['question_type'] = $dto->question_type;
            if ($dto->question_count !== null) $updates['question_count'] = $dto->question_count;
            if ($dto->points_per_question !== null) $updates['points_per_question'] = $dto->points_per_question;
            
            if (isset($dto->competency_uuid)) {
                $updates['competency_id'] = $dto->competency_uuid ? DB::table('competencies')->where('uuid', $dto->competency_uuid)->value('id') : null;
            }
            if (isset($dto->tag_uuid)) {
                $updates['tag_id'] = $dto->tag_uuid ? DB::table('question_tags')->where('uuid', $dto->tag_uuid)->value('id') : null;
            }
            if ($dto->status !== null) $updates['status'] = $dto->status;

            if (!empty($updates)) {
                $rule->update($updates);
            }
            return $rule;
        });
    }

    public function assignQuestions(int $sectionId, array $questionUuids, ?int $userId = null): void
    {
        DB::transaction(function () use ($sectionId, $questionUuids, $userId) {
            // Get question IDs
            $questionIds = DB::table('questions')->whereIn('uuid', $questionUuids)->pluck('id', 'uuid')->toArray();

            // Clear existing questions for this section
            DB::table('blueprint_section_questions')->where('blueprint_section_id', $sectionId)->delete();

            // Insert new questions with display order
            $insertData = [];
            $order = 1;
            foreach ($questionUuids as $uuid) {
                if (isset($questionIds[$uuid])) {
                    $insertData[] = [
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'blueprint_section_id' => $sectionId,
                        'question_id' => $questionIds[$uuid],
                        'display_order' => $order++,
                        'created_by' => $userId,
                        'created_date' => now(),
                    ];
                }
            }

            if (!empty($insertData)) {
                DB::table('blueprint_section_questions')->insert($insertData);
            }
        });
    }


    public function cloneBlueprint(int $sourceAssessmentId, int $newAssessmentId, int $clonedBy): void
    {
        $sourceBlueprint = \App\Modules\Assessment\Models\AssessmentBlueprint::where('assessment_id', $sourceAssessmentId)->first();
        
        if (!$sourceBlueprint) {
            return; // No blueprint to clone
        }

        // 1. Clone Blueprint
        $newBlueprintData = $sourceBlueprint->toArray();
        unset($newBlueprintData['id'], $newBlueprintData['uuid'], $newBlueprintData['created_date'], $newBlueprintData['modified_date']);
        $newBlueprintData['uuid'] = (string) \Illuminate\Support\Str::uuid();
        $newBlueprintData['assessment_id'] = $newAssessmentId;
        $newBlueprintData['created_by'] = $clonedBy;
        $newBlueprintData['modified_by'] = null;

        $newBlueprint = \App\Modules\Assessment\Models\AssessmentBlueprint::create($newBlueprintData);

        // 2. Clone Sections
        foreach ($sourceBlueprint->sections as $sourceSection) {
            $newSectionData = $sourceSection->toArray();
            unset($newSectionData['id'], $newSectionData['uuid'], $newSectionData['created_date'], $newSectionData['modified_date']);
            $newSectionData['uuid'] = (string) \Illuminate\Support\Str::uuid();
            $newSectionData['blueprint_id'] = $newBlueprint->id;
            $newSectionData['created_by'] = $clonedBy;
            $newSectionData['modified_by'] = null;

            $newSection = \App\Modules\Assessment\Models\BlueprintSection::create($newSectionData);

            // 3. Clone Rules
            foreach ($sourceSection->rules as $sourceRule) {
                $newRuleData = $sourceRule->toArray();
                unset($newRuleData['id'], $newRuleData['uuid'], $newRuleData['created_date'], $newRuleData['modified_date']);
                $newRuleData['uuid'] = (string) \Illuminate\Support\Str::uuid();
                $newRuleData['blueprint_section_id'] = $newSection->id;
                $newRuleData['created_by'] = $clonedBy;
                $newRuleData['modified_by'] = null;

                \App\Modules\Assessment\Models\BlueprintRule::create($newRuleData);
            }

            // 4. Clone Questions
            foreach ($sourceSection->sectionQuestions as $sourceQuestion) {
                $newQuestionData = $sourceQuestion->toArray();
                unset($newQuestionData['id'], $newQuestionData['uuid'], $newQuestionData['created_date'], $newQuestionData['modified_date']);
                $newQuestionData['uuid'] = (string) \Illuminate\Support\Str::uuid();
                $newQuestionData['blueprint_section_id'] = $newSection->id;
                $newQuestionData['created_by'] = $clonedBy;
                $newQuestionData['modified_by'] = null;

                \App\Modules\Assessment\Models\BlueprintSectionQuestion::create($newQuestionData);
            }
        }
    }
}

