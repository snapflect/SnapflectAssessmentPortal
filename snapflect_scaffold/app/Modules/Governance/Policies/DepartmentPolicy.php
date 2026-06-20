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
        return $user->organization_id === $department->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->roles->contains('role_code', 'ORG_ADMIN');
    }

    public function update(User $user, Department $department): bool
    {
        if ($user->roles->contains('role_code', 'ORG_ADMIN')) {
            return $user->organization_id === $department->organization_id;
        }

        if ($user->roles->contains('role_code', 'DEPT_MANAGER')) {
            return $user->department_id === $department->id;
        }

        return false;
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->roles->contains('role_code', 'ORG_ADMIN') && $user->organization_id === $department->organization_id;
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
