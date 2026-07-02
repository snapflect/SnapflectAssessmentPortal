<?php

declare(strict_types=1);

namespace App\Modules\Security\Repositories;

use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class UserRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User { return User::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?User { return User::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?User { return User::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?User { return User::with($relations)->where('uuid', $uuid)->first(); }
    public function findByEmail(string $email): ?User { return User::where('email', $email)->first(); }
    public function findWithTrashed(int $id): ?User { return User::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?User { return User::onlyTrashed()->find($id); }
    public function findAll(): Collection { return User::all(); }
    public function findAllByOrganization(int $organizationId): Collection { return User::where('organization_id', $organizationId)->get(); }
    public function search(string $term): Collection { return User::where('email', 'like', "%{$term}%")->orWhere('first_name', 'like', "%{$term}%")->get(); }
    public function searchByOrganization(int $organizationId, string $term): Collection { return User::where('organization_id', $organizationId)->where(function($query) use ($term) { $query->where('email', 'like', "%{$term}%")->orWhere('first_name', 'like', "%{$term}%"); })->get(); }
    public function query(): Builder { return User::query(); }
    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator { return User::with($relations)->paginate($perPage); }
    public function paginateByOrganization(int $organizationId, int $perPage = 15, array $relations = []): LengthAwarePaginator { return User::where('organization_id', $organizationId)->with($relations)->paginate($perPage); }
    public function create(array $data): User { return User::create($data); }
    public function update(User $user, array $data): bool { return $user->update($data); }
    public function delete(User $user): bool { return $user->delete(); }
}
