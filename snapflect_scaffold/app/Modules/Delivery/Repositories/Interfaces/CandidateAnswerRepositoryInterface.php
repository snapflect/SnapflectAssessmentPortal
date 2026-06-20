<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\CandidateAnswer;

interface CandidateAnswerRepositoryInterface
{
    public function findById(int $id): ?CandidateAnswer;\n    public function findByUuid(string $uuid): ?CandidateAnswer;\n    public function findByIdWithRelations(int $id, array $relations): ?CandidateAnswer;\n    public function findByUuidWithRelations(string $uuid, array $relations): ?CandidateAnswer;\n    public function findWithTrashed(int $id): ?CandidateAnswer;\n    public function findOnlyTrashed(int $id): ?CandidateAnswer;\n    public function findByAttempt(int $attemptId): Collection;\n    public function findByQuestion(int $questionId): Collection;\n    public function findLatestAnswer(int $attemptId, int $questionId): ?CandidateAnswer;\n    public function create(array $data): CandidateAnswer;\n    public function update(CandidateAnswer $answer, array $data): bool;\n    public function query(): Builder;
}
