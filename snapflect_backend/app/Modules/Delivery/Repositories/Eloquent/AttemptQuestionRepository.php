<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Eloquent;

use App\Modules\Delivery\Repositories\Interfaces\AttemptQuestionRepositoryInterface;
use App\Modules\Delivery\Models\AttemptQuestion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AttemptQuestionRepository implements AttemptQuestionRepositoryInterface
{
    public function findById(int $id): ?AttemptQuestion
    {
        return AttemptQuestion::find($id);
    }

    public function findByUuid(string $uuid): ?AttemptQuestion
    {
        return AttemptQuestion::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AttemptQuestion
    {
        return AttemptQuestion::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptQuestion
    {
        return AttemptQuestion::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?AttemptQuestion
    {
        return AttemptQuestion::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?AttemptQuestion
    {
        return AttemptQuestion::onlyTrashed()->find($id);
    }

    public function findByAttempt(int $attemptId): Collection
    {
        return AttemptQuestion::where('assessment_attempt_id', $attemptId)->orderBy('display_order')->get();
    }

    public function findBySection(int $sectionId): Collection
    {
        return AttemptQuestion::where('attempt_section_id', $sectionId)->orderBy('display_order')->get();
    }

    public function paginateByAttempt(int $attemptId, int $perPage = 15): LengthAwarePaginator
    {
        return AttemptQuestion::where('assessment_attempt_id', $attemptId)->orderBy('display_order')->paginate($perPage);
    }

    public function query(): Builder
    {
        return AttemptQuestion::query();
    }

    public function create(array $data): AttemptQuestion
    {
        return AttemptQuestion::create($data);
    }

    public function update(AttemptQuestion $question, array $data): bool
    {
        return $question->update($data);
    }
}
