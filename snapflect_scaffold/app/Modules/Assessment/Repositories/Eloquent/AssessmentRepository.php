<?php\n\ndeclare(strict_types=1);\n\nnamespace App\\Modules\\Assessment\\Repositories\\Eloquent;\n\nuse App\\Modules\\Assessment\\Models\\Assessment;\nuse App\\Modules\\Assessment\\Repositories\\Interfaces\\AssessmentRepositoryInterface;\n\nclass AssessmentRepository implements AssessmentRepositoryInterface\n{\n    protected Assessment $model;\n\n    public function __construct(Assessment $model)
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
        return $this->model->newQuery()->find($id);
    }

    public function findOnlyTrashed(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->model->newQuery()->where('is_deleted', true)->get();
    }\n\n    public function findPublished(int $organizationId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('is_published', true)
            ->where('current_state', 'PUBLISHED')
            ->get();
    }

    public function findDrafts(int $organizationId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('current_state', 'DRAFT')
            ->get();
    }

    public function findByState(int $organizationId, string $state): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('current_state', $state)
            ->get();
    }

    public function findByCategory(int $organizationId, int $categoryId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('assessment_category_id', $categoryId)
            ->get();
    }

    public function findByType(int $organizationId, int $typeId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('organization_id', $organizationId)
            ->where('assessment_type_id', $typeId)
            ->get();
    }\n}\n