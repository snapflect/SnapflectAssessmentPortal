<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Repositories\Eloquent;

use App\Modules\Assessment\Models\Question;
use App\Modules\Assessment\Repositories\Interfaces\QuestionRepositoryInterface;

class QuestionRepository implements QuestionRepositoryInterface
{
    protected Question $model;

    public function __construct(Question $model)
    {
        $this->model = $model;
    }

    protected function getBaseQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return $this->model->newQuery()->where('is_deleted', false);
    }

    public function findById(int $id): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->getBaseQuery()->find($id);
    }

    public function findByUuid(string $uuid): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->getBaseQuery()->where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations = []): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->getBaseQuery()->with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations = []): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->getBaseQuery()->with($relations)->where('uuid', $uuid)->first();
    }

    public function create(array $data): \Illuminate\Database\Eloquent\Model
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $record = $this->getBaseQuery()->find($id);
        if (!$record) return false;
        return $record->update($data);
    }

    public function delete(int $id): bool
    {
        $record = $this->getBaseQuery()->find($id);
        if (!$record) return false;
        
        return $record->update([
            'is_deleted' => true,
            'deleted_date' => now(),
            'status' => 'DELETED'
        ]);
    }

    public function paginate(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->getBaseQuery()->paginate($perPage);
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->getBaseQuery()->where('organization_id', $organizationId)->paginate($perPage);
    }

    public function search(array $criteria): \Illuminate\Database\Eloquent\Collection
    {
        $query = $this->getBaseQuery();
        foreach ($criteria as $field => $value) {
            $query->where($field, $value);
        }
        return $query->get();
    }

    public function searchByOrganization(int $organizationId, array $criteria): \Illuminate\Database\Eloquent\Collection
    {
        $query = $this->getBaseQuery()->where('organization_id', $organizationId);
        foreach ($criteria as $field => $value) {
            $query->where($field, $value);
        }
        return $query->get();
    }

    public function query(): \Illuminate\Database\Eloquent\Builder
    {
        return $this->getBaseQuery();
    }

    public function findWithTrashed(int $id): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->model->withTrashed()->find($id);
    }

    public function findOnlyTrashed(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->model->onlyTrashed()->where('is_deleted', true)->get();
    }

    public function findByQuestionBank(int $questionBankId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()->where('question_bank_id', $questionBankId)->get();
    }

    public function findByDifficulty(int $organizationId, string $difficulty): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('difficulty_level', $difficulty)
            ->get();
    }

    public function findByType(int $organizationId, string $type): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('question_type', $type)
            ->get();
    }

    public function findByTag(int $tagId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->whereHas('tags', function($q) use ($tagId) {
                $q->where('question_tags.id', $tagId);
            })->get();
    }

    public function findByCompetency(int $competencyId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->whereHas('competencies', function($q) use ($competencyId) {
                $q->where('competencies.id', $competencyId);
            })->get();
    }
}
