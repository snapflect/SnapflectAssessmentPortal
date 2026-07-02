<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AttemptSubmission;

interface AttemptSubmissionRepositoryInterface
{
public function findById(int $id): ?AttemptSubmission;
public function findByUuid(string $uuid): ?AttemptSubmission;
public function findByIdWithRelations(int $id, array $relations): ?AttemptSubmission;
public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptSubmission;
public function findByAttempt(int $attemptId): ?AttemptSubmission;
public function create(array $data): AttemptSubmission;
public function query(): Builder;
}
