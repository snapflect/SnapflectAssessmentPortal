<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\CompetencyGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompetencyPolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability): ?bool
    {
        if ($user->hasRole('Platform Admin')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole(['Organization Admin', 'Department Manager']);
    }

    public function view(User $user, CompetencyGroup $competencyGroup): bool
    {
        if (!$user->hasRole(['Organization Admin', 'Department Manager'])) {
            return false;
        }
        return $user->organization_id === $competencyGroup->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Organization Admin');
    }

    public function update(User $user, CompetencyGroup $competencyGroup): bool
    {
        if (!$user->hasRole('Organization Admin')) {
            return false;
        }
        return $user->organization_id === $competencyGroup->organization_id;
    }

    public function delete(User $user, CompetencyGroup $competencyGroup): bool
    {
        if (!$user->hasRole('Organization Admin')) {
            return false;
        }
        return $user->organization_id === $competencyGroup->organization_id;
    }
}
