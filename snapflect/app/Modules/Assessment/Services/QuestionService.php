<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateQuestionDto;
use App\Modules\Assessment\Repositories\Interfaces\QuestionRepositoryInterface;
use Illuminate\Support\Facades\DB;

class QuestionService
{
    private QuestionRepositoryInterface $questionRepo;

    public function __construct(QuestionRepositoryInterface $questionRepo)
    {
        $this->questionRepo = $questionRepo;
    }

    public function createQuestion(int $organizationId, CreateQuestionDto $dto)
    {
        return DB::transaction(function () use ($organizationId, $dto) {
            // Resolve Bank UUID
            // Insert Question
            // Loop $dto->options -> Insert QuestionOptions
            // Loop $dto->tag_uuids -> Insert Mappings
            // Loop $dto->competency_uuids -> Insert Competency Mappings
            return true;
        });
    }
}
