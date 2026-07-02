<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateQuestionDto;
use App\Modules\Assessment\DTOs\UpdateQuestionDto;
use App\Modules\Assessment\Models\Question;
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
            unset($data['options']);

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
            
            return $newQuestion;
        });
    }
}
