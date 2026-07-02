<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Repositories\Interfaces;

use Illuminate\Pagination\LengthAwarePaginator;

interface CompetencyGroupRepositoryInterface
{
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    
    public function findById(int $id): ?object;
    
    public function findByUuid(string $uuid): ?object;
    
    public function create(array $data): \Illuminate\Database\Eloquent\Model;
    
    public function update(int $id, array $data): bool;
    
    public function delete(int $id): bool;
}
