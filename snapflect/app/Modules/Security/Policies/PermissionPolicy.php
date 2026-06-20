<?php

declare(strict_types=1);

namespace App\Modules\Security\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Permission;
use Illuminate\Auth\Access\HandlesAuthorization;

class PermissionPolicy
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
        return true; // Permissions are typically globally viewable by admins mapping them
    }

    public function view(User $user, Permission $permission): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return false; // Only Platform Admin
    }

    public function update(User $user, Permission $permission): bool
    {
        return false; // Only Platform Admin
    }

    public function delete(User $user, Permission $permission): bool
    {
        return false; // Only Platform Admin
    }

    public function restore(User $user, Permission $permission): bool
    {
        return false;
    }

    public function forceDelete(User $user, Permission $permission): bool
    {
        return false;
    }
}
