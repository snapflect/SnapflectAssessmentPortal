<?php\n\ndeclare(strict_types=1);\n\nnamespace App\\Modules\\Assessment\\Repositories\\Interfaces;\n\ninterface BlueprintRepositoryInterface\n{\n    public function findById(int $id): ?\Illuminate\Database\Eloquent\Model;
    public function findByUuid(string $uuid): ?\Illuminate\Database\Eloquent\Model;
    public function findByIdWithRelations(int $id, array $relations = []): ?\Illuminate\Database\Eloquent\Model;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?\Illuminate\Database\Eloquent\Model;
    public function create(array $data): \Illuminate\Database\Eloquent\Model;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function paginate(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator;
    public function paginateByOrganization(int $organizationId, int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator;
    public function search(array $criteria): \Illuminate\Database\Eloquent\Collection;
    public function searchByOrganization(int $organizationId, array $criteria): \Illuminate\Database\Eloquent\Collection;
    public function query(): \Illuminate\Database\Eloquent\Builder;
    public function findWithTrashed(int $id): ?\Illuminate\Database\Eloquent\Model;
    public function findOnlyTrashed(): \Illuminate\Database\Eloquent\Collection;\n    public function findByAssessment(int $assessmentId): ?\Illuminate\Database\Eloquent\Model;
    public function findSections(int $blueprintId): \Illuminate\Database\Eloquent\Collection;
    public function findRules(int $sectionId): \Illuminate\Database\Eloquent\Collection;\n}\n