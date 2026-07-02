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
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER']);
    }

    public function view(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER'])) {
            return false;
        }
        return $user->organization_id === $assessment->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR']);
    }

    public function update(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR'])) {
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
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER'])) {
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
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR'])) {
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
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER'])) {
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

    public function publish(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER'])) {
            return false;
        }
        if ($user->organization_id !== $assessment->organization_id) {
            return false;
        }
        if ($assessment->current_state !== 'APPROVED') {
            return false;
        }
        return true;
    }

    public function approve(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER'])) {
            return false;
        }
        if ($user->organization_id !== $assessment->organization_id) {
            return false;
        }
        if ($assessment->current_state !== 'IN_REVIEW') {
            return false;
        }
        return true;
    }
}
