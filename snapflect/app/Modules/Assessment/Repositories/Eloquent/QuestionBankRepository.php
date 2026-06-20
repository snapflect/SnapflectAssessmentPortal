<?php\n\ndeclare(strict_types=1);\n\nnamespace App\\Modules\\Assessment\\Repositories\\Eloquent;\n\nuse App\\Modules\\Assessment\\Models\\QuestionBank;\nuse App\\Modules\\Assessment\\Repositories\\Interfaces\\QuestionBankRepositoryInterface;\n\nclass QuestionBankRepository implements QuestionBankRepositoryInterface\n{\n    protected QuestionBank $model;\n\n    public function __construct(QuestionBank $model)
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
    }\n\n    protected function getBaseQuery(): \Illuminate\Database\Eloquent\Builder
    {
        // For question banks, we need to handle system banks dynamically.
        // We still exclude deleted records.
        return $this->model->newQuery()->where('is_deleted', false);
    }
    
    // Override standard paginateByOrganization to include system banks
    public function paginateByOrganization(int $organizationId, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->getBaseQuery()
            ->where(function($q) use ($organizationId) {
                $q->where('organization_id', $organizationId)
                  ->orWhere('is_system_bank', true);
            })
            ->paginate($perPage);
    }\n}\n