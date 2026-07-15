<?php

declare(strict_types=1);

namespace App\Modules\Governance\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Governance\Models\BusinessUnit;
use Illuminate\Auth\Access\HandlesAuthorization;

class BusinessUnitPolicy
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

    public function view(User $user, BusinessUnit $businessUnit): bool
    {
        return $user->canAccessPlacement($businessUnit);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('CLIENT_ADMIN');
    }

    public function update(User $user, BusinessUnit $businessUnit): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $businessUnit->organization_id;
    }

    public function delete(User $user, BusinessUnit $businessUnit): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $businessUnit->organization_id;
    }

    public function restore(User $user, BusinessUnit $businessUnit): bool
    {
        return false;
    }

    public function forceDelete(User $user, BusinessUnit $businessUnit): bool
    {
        return false;
    }
}
