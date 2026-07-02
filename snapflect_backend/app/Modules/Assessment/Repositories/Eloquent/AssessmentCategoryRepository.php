<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Repositories\Eloquent;

use App\Modules\Assessment\Models\AssessmentCategory;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentCategoryRepositoryInterface;

class AssessmentCategoryRepository implements AssessmentCategoryRepositoryInterface
{
    protected AssessmentCategory $model;

    public function __construct(AssessmentCategory $model)
    {
        $this->model = $model;
    }

    public function findById(int $id): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->model->newQuery()->find($id);
    }

    public function findByUuid(string $uuid): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->model->newQuery()->where('uuid', $uuid)->first();
    }

    public function create(array $data): \Illuminate\Database\Eloquent\Model
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $record = $this->findById($id);
        if (!$record) return false;
        return $record->update($data);
    }

    public function delete(int $id): bool
    {
        $record = $this->findById($id);
        if (!$record) return false;
        return $record->delete();
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->model->newQuery()->where('organization_id', $organizationId)->paginate($perPage);
    }
}
