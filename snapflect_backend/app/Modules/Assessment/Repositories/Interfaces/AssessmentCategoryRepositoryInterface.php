<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Repositories\Interfaces;

interface AssessmentCategoryRepositoryInterface
{
    public function findById(int $id): ?\Illuminate\Database\Eloquent\Model;
    public function findByUuid(string $uuid): ?\Illuminate\Database\Eloquent\Model;
    public function create(array $data): \Illuminate\Database\Eloquent\Model;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function paginateByOrganization(int $organizationId, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator;
}
