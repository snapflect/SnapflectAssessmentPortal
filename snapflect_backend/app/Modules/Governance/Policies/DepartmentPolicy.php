<?php

declare(strict_types=1);

namespace App\Modules\Governance\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Governance\Models\Department;
use Illuminate\Auth\Access\HandlesAuthorization;

class DepartmentPolicy
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

    public function view(User $user, Department $department): bool
    {
        return $user->canAccessPlacement($department);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('CLIENT_ADMIN');
    }

    public function update(User $user, Department $department): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $department->organization_id;
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $department->organization_id;
    }

    public function restore(User $user, Department $department): bool
    {
        return false;
    }

    public function forceDelete(User $user, Department $department): bool
    {
        return false;
    }
}
