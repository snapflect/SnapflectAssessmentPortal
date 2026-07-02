<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Repositories\Interfaces\CandidateAnswerRepositoryInterface;
use App\Modules\Delivery\DTOs\CreateAnswerDto;
use App\Modules\Delivery\DTOs\UpdateAnswerDto;
use App\Modules\Delivery\DTOs\AutoSaveAnswerDto;
use App\Modules\Delivery\DTOs\FlagQuestionDto;
use Illuminate\Support\Facades\DB;

class CandidateAnswerService
{
    public function __construct(
        private readonly CandidateAnswerRepositoryInterface $answerRepository,
        private readonly AttemptAuditService $auditService
    ) {}

    public function createAnswer(CreateAnswerDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            // Save answer
            // Increment answer_version
            // Audit Event: ANSWER_SAVED
            return [];
        });
    }

    public function updateAnswer(UpdateAnswerDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            // Update answer
            // Increment answer_version
            // Audit Event: ANSWER_UPDATED
            return [];
        });
    }

    public function autoSaveAnswer(AutoSaveAnswerDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Auto Save Logic
            // Audit Event: ANSWER_UPDATED
        });
    }

    public function flagQuestion(FlagQuestionDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Audit Event: QUESTION_FLAGGED
        });
    }

    public function unflagQuestion(FlagQuestionDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Audit Event: QUESTION_UNFLAGGED
        });
    }
}
