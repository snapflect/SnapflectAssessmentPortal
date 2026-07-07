<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\AssessmentCategory;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssessmentCategoryPolicy
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
        return $user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'CLIENT_ADMIN', 'REVIEWER', 'READ_ONLY']);
    }

    public function view(User $user, AssessmentCategory $category): bool
    {
        if (!$user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'CLIENT_ADMIN', 'REVIEWER', 'READ_ONLY'])) {
            return false;
        }
        return $user->organization_id === $category->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER']);
    }

    public function update(User $user, AssessmentCategory $category): bool
    {
        if (!$user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER'])) {
            return false;
        }
        return $user->organization_id === $category->organization_id;
    }

    public function delete(User $user, AssessmentCategory $category): bool
    {
        if (!$user->hasRole('ORG_ADMIN')) {
            return false;
        }
        return $user->organization_id === $category->organization_id;
    }
}
