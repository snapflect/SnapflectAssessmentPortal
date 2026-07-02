<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\CompetencyGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompetencyGroupPolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('CLIENT_ADMIN');
    }

    public function view(User $user, CompetencyGroup $competencyGroup): bool
    {
        if (!$user->hasRole('CLIENT_ADMIN')) {
            return false;
        }
        return $user->organization_id === $competencyGroup->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('CLIENT_ADMIN');
    }

    public function update(User $user, CompetencyGroup $competencyGroup): bool
    {
        if (!$user->hasRole('CLIENT_ADMIN')) {
            return false;
        }
        return $user->organization_id === $competencyGroup->organization_id;
    }

    public function delete(User $user, CompetencyGroup $competencyGroup): bool
    {
        if (!$user->hasRole('CLIENT_ADMIN')) {
            return false;
        }
        return $user->organization_id === $competencyGroup->organization_id;
    }
}
