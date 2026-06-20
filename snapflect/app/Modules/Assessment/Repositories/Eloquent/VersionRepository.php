<?php\n\ndeclare(strict_types=1);\n\nnamespace App\\Modules\\Assessment\\Repositories\\Eloquent;\n\nuse App\\Modules\\Assessment\\Models\\AssessmentVersion;\nuse App\\Modules\\Assessment\\Repositories\\Interfaces\\VersionRepositoryInterface;\n\nclass VersionRepository implements VersionRepositoryInterface\n{\n    protected AssessmentVersion $model;\n\n    public function __construct(AssessmentVersion $model)
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
    }\n\n    public function findCurrentVersion(int $assessmentId): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->getBaseQuery()
            ->where('assessment_id', $assessmentId)
            ->orderBy('major_version', 'desc')
            ->orderBy('minor_version', 'desc')
            ->first();
    }

    public function findVersionHistory(int $assessmentId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()
            ->where('assessment_id', $assessmentId)
            ->orderBy('major_version', 'desc')
            ->orderBy('minor_version', 'desc')
            ->get();
    }

    public function findChildren(int $parentVersionId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getBaseQuery()->where('parent_version_id', $parentVersionId)->get();
    }

    public function findParent(int $versionId): ?\Illuminate\Database\Eloquent\Model
    {
        $version = $this->findById($versionId);
        if ($version && $version->parent_version_id) {
            return $this->findById($version->parent_version_id);
        }
        return null;
    }\n}\n