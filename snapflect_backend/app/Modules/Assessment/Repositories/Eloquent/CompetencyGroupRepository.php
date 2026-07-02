<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Repositories\Eloquent;

use App\Modules\Assessment\Models\CompetencyGroup;
use App\Modules\Assessment\Repositories\Interfaces\CompetencyGroupRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CompetencyGroupRepository implements CompetencyGroupRepositoryInterface
{
    protected CompetencyGroup $model;

    public function __construct(CompetencyGroup $model)
    {
        $this->model = $model;
    }

    protected function getBaseQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return $this->model->newQuery()->where('is_deleted', false);
    }

    public function findById(int $id): ?object
    {
        return $this->getBaseQuery()->find($id);
    }

    public function findByUuid(string $uuid): ?object
    {
        return $this->getBaseQuery()->where('uuid', $uuid)->first();
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->getBaseQuery()->where('organization_id', $organizationId)->paginate($perPage);
    }

    public function create(array $data): \Illuminate\Database\Eloquent\Model
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $record = $this->model->find($id);
        if (!$record) return false;
        return $record->update($data);
    }

    public function delete(int $id): bool
    {
        $record = $this->model->find($id);
        if (!$record) return false;
        return $record->delete();
    }
}
