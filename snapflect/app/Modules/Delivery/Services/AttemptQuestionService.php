<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

App\Modules\Delivery\Repositories\Interfaces\AttemptQuestionRepositoryInterface;\nApp\Modules\Delivery\DTOs\LoadAttemptQuestionsDto;\nApp\Modules\Delivery\DTOs\NavigateQuestionDto;\nIlluminate\Support\Facades\DB;

class AttemptQuestionService
{
    public function __construct(
        private readonly AttemptQuestionRepositoryInterface $questionRepository,
        private readonly AttemptAuditService $auditService
    ) {}

    public function loadQuestions(LoadAttemptQuestionsDto $dto): array
    {
        // Must consume assessment snapshot
        return [];
    }

    public function loadQuestion(string $questionUuid): array
    {
        // Return snapshot question data
        return [];
    }

    public function nextQuestion(NavigateQuestionDto $dto): array
    {
        // Audit Event: QUESTION_VIEWED
        return [];
    }

    public function previousQuestion(NavigateQuestionDto $dto): array
    {
        // Audit Event: QUESTION_VIEWED
        return [];
    }

    public function jumpToQuestion(NavigateQuestionDto $dto): array
    {
        // Audit Event: QUESTION_VIEWED
        return [];
    }
}
