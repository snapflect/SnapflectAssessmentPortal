<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AttemptQuestion;

interface AttemptQuestionRepositoryInterface
{
    public function findById(int $id): ?AttemptQuestion;\n    public function findByUuid(string $uuid): ?AttemptQuestion;\n    public function findByIdWithRelations(int $id, array $relations): ?AttemptQuestion;\n    public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptQuestion;\n    public function findWithTrashed(int $id): ?AttemptQuestion;\n    public function findOnlyTrashed(int $id): ?AttemptQuestion;\n    public function findByAttempt(int $attemptId): Collection;\n    public function findBySection(int $sectionId): Collection;\n    public function paginateByAttempt(int $attemptId, int $perPage = 15): LengthAwarePaginator;\n    public function query(): Builder;\n    public function create(array $data): AttemptQuestion;\n    public function update(AttemptQuestion $question, array $data): bool;
}
