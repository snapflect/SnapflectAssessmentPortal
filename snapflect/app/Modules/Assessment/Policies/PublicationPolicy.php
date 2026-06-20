<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Auth\Access\HandlesAuthorization;

class PublicationPolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability): ?bool
    {
        if ($user->hasRole('Platform Admin')) {
            return true;
        }
        return null;
    }

    public function publish(User $user, Assessment $assessment): bool
    {
        if (!$user->hasRole('Organization Admin')) {
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
