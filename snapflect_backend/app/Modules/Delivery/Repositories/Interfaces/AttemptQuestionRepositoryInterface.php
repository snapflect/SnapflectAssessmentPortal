<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AttemptQuestion;

interface AttemptQuestionRepositoryInterface
{
public function findById(int $id): ?AttemptQuestion;
public function findByUuid(string $uuid): ?AttemptQuestion;
public function findByIdWithRelations(int $id, array $relations): ?AttemptQuestion;
public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptQuestion;
public function findWithTrashed(int $id): ?AttemptQuestion;
public function findOnlyTrashed(int $id): ?AttemptQuestion;
public function findByAttempt(int $attemptId): Collection;
public function findBySection(int $sectionId): Collection;
public function paginateByAttempt(int $attemptId, int $perPage = 15): LengthAwarePaginator;
public function query(): Builder;
public function create(array $data): AttemptQuestion;
public function update(AttemptQuestion $question, array $data): bool;
}
