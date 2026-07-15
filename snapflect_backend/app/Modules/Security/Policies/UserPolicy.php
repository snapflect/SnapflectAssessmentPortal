<?php

declare(strict_types=1);

namespace App\Modules\Security\Policies;

use App\Modules\Security\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
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

    public function view(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }
        return $user->canAccessPlacement($model);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('CLIENT_ADMIN');
    }

    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }

        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $model->organization_id;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $model->organization_id;
    }

    public function restore(User $user, User $model): bool
    {
        return false;
    }

    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }

    /**
     * PLATFORM_ADMIN is allowed by the before() hook.
     * CLIENT_ADMIN can assign roles to users in their own organization.
     */
    public function assignRole(User $user, User $model): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $model->organization_id;
    }

    /**
     * PLATFORM_ADMIN is allowed by the before() hook.
     * CLIENT_ADMIN can revoke roles from users in their own organization.
     */
    public function revokeRole(User $user, User $model): bool
    {
        return $user->hasRole('CLIENT_ADMIN') && $user->organization_id === $model->organization_id;
    }
}
