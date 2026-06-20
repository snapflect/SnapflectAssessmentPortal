<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssessmentPolicy
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

    public function view(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole(['Organization Admin', 'Department Manager'])) {
            return false;
        }
        return $user->organization_id === $assessment->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['Organization Admin', 'Department Manager']);
    }

    public function update(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole(['Organization Admin', 'Department Manager'])) {
            return false;
        }
        if ($user->organization_id !== $assessment->organization_id) {
            return false;
        }
        if ($assessment->current_state === 'PUBLISHED' || $assessment->current_state === 'ARCHIVED') {
            return false;
        }
        return true;
    }

    public function delete(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole('Organization Admin')) {
            return false;
        }
        if ($user->organization_id !== $assessment->organization_id) {
            return false;
        }
        if ($assessment->current_state === 'PUBLISHED') {
            return false;
        }
        return true;
    }

    public function submitReview(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole('Organization Admin')) {
            return false;
        }
        if ($user->organization_id !== $assessment->organization_id) {
            return false;
        }
        if ($assessment->current_state !== 'DRAFT') {
            return false;
        }
        return true;
    }

    public function archive(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole('Organization Admin')) {
            return false;
        }
        if ($user->organization_id !== $assessment->organization_id) {
            return false;
        }
        if ($assessment->current_state !== 'PUBLISHED') {
            return false;
        }
        return true;
    }
}
