<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Repositories\Eloquent;

use App\Modules\Assessment\Models\AssessmentBlueprint;
use App\Modules\Assessment\Repositories\Interfaces\BlueprintRepositoryInterface;

class BlueprintRepository implements BlueprintRepositoryInterface
{
    protected AssessmentBlueprint $model;

    public function __construct(AssessmentBlueprint $model)
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
        return $this->model->onlyTrashed()->get();
    }

    public function findByAssessment(int $assessmentId): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->getBaseQuery()->where('assessment_id', $assessmentId)->first();
    }

    public function findSections(int $blueprintId): \Illuminate\Database\Eloquent\Collection
    {
        // Fetch blueprint with eager loaded sections to avoid N+1
        $blueprint = $this->getBaseQuery()->with('sections')->find($blueprintId);
        return $blueprint ? $blueprint->sections : collect();
    }

    public function findRules(int $sectionId): \Illuminate\Database\Eloquent\Collection
    {
        $blueprint = $this->getBaseQuery()->whereHas('sections', function($q) use ($sectionId) {
            $q->where('id', $sectionId);
        })->with(['sections' => function($q) use ($sectionId) {
            $q->where('id', $sectionId)->with('rules');
        }])->first();

        if ($blueprint && $blueprint->sections->count() > 0) {
            return $blueprint->sections->first()->rules;
        }
        return collect();
    }
}
