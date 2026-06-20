<?php

declare(strict_types=1);

namespace App\Modules\Security\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use Illuminate\Auth\Access\HandlesAuthorization;

class RolePolicy
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

    public function view(User $user, Role $role): bool
    {
        if ($role->organization_id === null) {
            return true; // Global roles are viewable
        }
        return $user->organization_id === $role->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->roles->contains('role_code', 'ORG_ADMIN');
    }

    public function update(User $user, Role $role): bool
    {
        if ($role->organization_id === null || $role->is_system_role) {
            return false; // Only Platform Admins can update system/global roles
        }
        return $user->roles->contains('role_code', 'ORG_ADMIN') && $user->organization_id === $role->organization_id;
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->organization_id === null || $role->is_system_role) {
            return false;
        }
        return $user->roles->contains('role_code', 'ORG_ADMIN') && $user->organization_id === $role->organization_id;
    }

    public function restore(User $user, Role $role): bool
    {
        return false;
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return false;
    }
}
