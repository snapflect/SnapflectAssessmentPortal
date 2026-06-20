<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Eloquent;

use App\Modules\Delivery\Repositories\Interfaces\CandidateAnswerRepositoryInterface;
use App\Modules\Delivery\Models\CandidateAnswer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CandidateAnswerRepository implements CandidateAnswerRepositoryInterface
{
    public function findById(int $id): ?CandidateAnswer
    {
        return CandidateAnswer::find($id);
    }

    public function findByUuid(string $uuid): ?CandidateAnswer
    {
        return CandidateAnswer::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?CandidateAnswer
    {
        return CandidateAnswer::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?CandidateAnswer
    {
        return CandidateAnswer::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?CandidateAnswer
    {
        return CandidateAnswer::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?CandidateAnswer
    {
        return CandidateAnswer::onlyTrashed()->find($id);
    }

    public function findByAttempt(int $attemptId): Collection
    {
        return CandidateAnswer::where('assessment_attempt_id', $attemptId)->get();
    }

    public function findByQuestion(int $questionId): Collection
    {
        return CandidateAnswer::where('attempt_question_id', $questionId)->get();
    }

    public function findLatestAnswer(int $attemptId, int $questionId): ?CandidateAnswer
    {
        return CandidateAnswer::where('assessment_attempt_id', $attemptId)
            ->where('attempt_question_id', $questionId)
            ->orderByDesc('answer_version')
            ->first();
    }

    public function create(array $data): CandidateAnswer
    {
        return CandidateAnswer::create($data);
    }

    public function update(CandidateAnswer $answer, array $data): bool
    {
        return $answer->update($data);
    }

    public function query(): Builder
    {
        return CandidateAnswer::query();
    }
}
