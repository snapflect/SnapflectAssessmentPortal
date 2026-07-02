<?php

declare(strict_types=1);

namespace App\Modules\Governance\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Governance\Models\Organization;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrganizationPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Organization $organization): bool
    {
        return $user->organization_id === $organization->id;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Organization $organization): bool
    {
        return $user->roles->contains('role_code', 'ORG_ADMIN') && $user->organization_id === $organization->id;
    }

    public function delete(User $user, Organization $organization): bool
    {
        return false;
    }

    public function restore(User $user, Organization $organization): bool
    {
        return false;
    }

    public function forceDelete(User $user, Organization $organization): bool
    {
        return false;
    }
}
