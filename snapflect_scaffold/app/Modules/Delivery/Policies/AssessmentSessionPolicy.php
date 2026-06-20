<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\AssessmentSession;

use Illuminate\Auth\Access\HandlesAuthorization;

class AssessmentSessionPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $session->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }

    public function resume(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $session->candidate_user_id;
        }

        return false;
    }

    public function terminate(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }
}
