<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\CandidateAnswer;

interface CandidateAnswerRepositoryInterface
{
public function findById(int $id): ?CandidateAnswer;
public function findByUuid(string $uuid): ?CandidateAnswer;
public function findByIdWithRelations(int $id, array $relations): ?CandidateAnswer;
public function findByUuidWithRelations(string $uuid, array $relations): ?CandidateAnswer;
public function findWithTrashed(int $id): ?CandidateAnswer;
public function findOnlyTrashed(int $id): ?CandidateAnswer;
public function findByAttempt(int $attemptId): Collection;
public function findByQuestion(int $questionId): Collection;
public function findLatestAnswer(int $attemptId, int $questionId): ?CandidateAnswer;
public function create(array $data): CandidateAnswer;
public function update(CandidateAnswer $answer, array $data): bool;
public function query(): Builder;
}
