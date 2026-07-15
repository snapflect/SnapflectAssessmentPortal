<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateQuestionDto;
use App\Modules\Assessment\DTOs\UpdateQuestionDto;
use App\Modules\Assessment\Models\Question;
use App\Modules\Assessment\Models\Competency;
use App\Modules\Assessment\Models\QuestionTag;
use App\Modules\Assessment\Repositories\Interfaces\QuestionRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\QuestionBankRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuestionService
{
    public function __construct(
        private QuestionRepositoryInterface $questionRepo,
        private QuestionBankRepositoryInterface $bankRepo
    ) {}

    public function createQuestion(int $organizationId, CreateQuestionDto $dto, int $userId): Question
    {
        return DB::transaction(function () use ($organizationId, $dto, $userId) {
            $bank = $this->bankRepo->findByUuid($dto->question_bank_uuid);
            if (!$bank) {
                abort(404, 'Question Bank not found');
            }

            $data = $dto->toArray();

            if (empty($data['question_code'])) {
                $baseCode = Str::slug(Str::limit(strip_tags($data['question_text']), 30, ''));
                if (empty($baseCode)) {
                    $baseCode = 'q';
                }
                $code = $baseCode;
                $counter = 1;
                while (\App\Modules\Assessment\Models\Question::where('question_code', $code)->whereNull('deleted_date')->exists()) {
                    $code = $baseCode . '-' . $counter;
                    $counter++;
                }
                $data['question_code'] = $code;
            }

            $data['organization_id'] = $organizationId;
            $data['question_bank_id'] = $bank->id;
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            
            // Remove relationships data from main record array
            unset($data['question_bank_uuid']);
            unset($data['options']);
            unset($data['competency_uuids']);
            unset($data['tag_uuids']);

            $question = $this->questionRepo->create($data);

            if (!empty($dto->options) && $dto->question_type !== 'ESSAY') {
                foreach ($dto->options as $optionDto) {
                    $question->options()->create([
                        'uuid' => (string) Str::uuid(),
                        'option_text' => $optionDto->option_text,
                        'display_order' => $optionDto->display_order,
                        'is_correct' => $optionDto->is_correct,
                        'created_by' => $userId,
                        'modified_by' => $userId
                    ]);
                }
            }

            if (!empty($dto->competency_uuids)) {
                $competencyIds = Competency::whereIn('uuid', $dto->competency_uuids)->pluck('id')->toArray();
                // Assign a default weight of 100 since we don't have a UI for weights yet
                $syncData = [];
                foreach ($competencyIds as $cId) {
                    $syncData[$cId] = [
                        'uuid' => (string) Str::uuid(),
                        'weight_percentage' => 100
                    ];
                }
                $question->competencies()->sync($syncData);
            }

            if (!empty($dto->tag_uuids)) {
                $tagIds = QuestionTag::whereIn('uuid', $dto->tag_uuids)->pluck('id')->toArray();
                $syncData = [];
                foreach ($tagIds as $tId) {
                    $syncData[$tId] = ['uuid' => (string) Str::uuid()];
                }
                $question->tags()->sync($syncData);
            }

            return $question;
        });
    }

    public function updateQuestion(int $id, UpdateQuestionDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($id, $dto, $userId) {
            $question = $this->questionRepo->findById($id);
            if (!$question) {
                return false;
            }

            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            
            $options = $data['options'] ?? null;
            $competencyUuids = $data['competency_uuids'] ?? null;
            $tagUuids = $data['tag_uuids'] ?? null;
            
            unset($data['options']);
            unset($data['competency_uuids']);
            unset($data['tag_uuids']);

            $this->questionRepo->update($id, $data);

            if ($options !== null && $question->question_type !== 'ESSAY') {
                // To keep it simple, we delete all existing options and re-insert
                // (In a highly robust system you'd diff them by UUID, but this is a full replacement array from frontend usually)
                $question->options()->delete();
                
                foreach ($options as $optionDto) {
                    $question->options()->create([
                        'uuid' => (string) Str::uuid(),
                        'option_text' => $optionDto->option_text,
                        'display_order' => $optionDto->display_order,
                        'is_correct' => $optionDto->is_correct,
                        'created_by' => $userId,
                        'modified_by' => $userId
                    ]);
                }
            } else if ($question->question_type === 'ESSAY') {
                $question->options()->delete();
            }

            if ($competencyUuids !== null) {
                $competencyIds = Competency::whereIn('uuid', $competencyUuids)->pluck('id')->toArray();
                $syncData = [];
                foreach ($competencyIds as $cId) {
                    $syncData[$cId] = [
                        'uuid' => (string) Str::uuid(),
                        'weight_percentage' => 100
                    ];
                }
                $question->competencies()->sync($syncData);
            }

            if ($tagUuids !== null) {
                $tagIds = QuestionTag::whereIn('uuid', $tagUuids)->pluck('id')->toArray();
                $syncData = [];
                foreach ($tagIds as $tId) {
                    $syncData[$tId] = ['uuid' => (string) Str::uuid()];
                }
                $question->tags()->sync($syncData);
            }

            return true;
        });
    }

    public function deleteQuestion(int $id, int $userId): bool
    {
        return DB::transaction(function () use ($id, $userId) {
            $question = $this->questionRepo->findById($id);
            if (!$question) {
                return false;
            }
            
            $this->questionRepo->update($id, [
                'deleted_by' => $userId,
                'is_deleted' => true,
                'status' => 'DELETED',
                'deleted_date' => now()
            ]);
            
            return true;
        });
    }
    
    public function cloneQuestion(Question $question, string $targetBankUuid, int $organizationId, int $userId): Question
    {
        return DB::transaction(function () use ($question, $targetBankUuid, $organizationId, $userId) {
            $targetBank = $this->bankRepo->findByUuid($targetBankUuid);
            if (!$targetBank) {
                abort(404, 'Target Question Bank not found');
            }
            
            $newCode = $question->question_code . '-CLONE-' . substr(uniqid(), -4);
            
            $cloneData = $question->toArray();
            unset($cloneData['id']);
            unset($cloneData['uuid']);
            unset($cloneData['created_at']);
            unset($cloneData['updated_at']);
            
            $cloneData['organization_id'] = $organizationId;
            $cloneData['question_bank_id'] = $targetBank->id;
            $cloneData['question_code'] = $newCode;
            $cloneData['created_by'] = $userId;
            $cloneData['modified_by'] = $userId;
            
            $newQuestion = $this->questionRepo->create($cloneData);
            
            foreach ($question->options as $option) {
                $newQuestion->options()->create([
                    'uuid' => (string) Str::uuid(),
                    'option_text' => $option->option_text,
                    'display_order' => $option->display_order,
                    'is_correct' => $option->is_correct,
                    'created_by' => $userId,
                    'modified_by' => $userId
                ]);
            }
            
            if ($question->competencies->isNotEmpty()) {
                $syncData = [];
                foreach ($question->competencies as $competency) {
                    $syncData[$competency->id] = [
                        'uuid' => (string) Str::uuid(),
                        'weight_percentage' => $competency->pivot ? $competency->pivot->weight_percentage : 100
                    ];
                }
                $newQuestion->competencies()->sync($syncData);
            }

            if ($question->tags->isNotEmpty()) {
                $syncData = [];
                foreach ($question->tags as $tag) {
                    $syncData[$tag->id] = ['uuid' => (string) Str::uuid()];
                }
                $newQuestion->tags()->sync($syncData);
            }
            
            return $newQuestion;
        });
    }
}
