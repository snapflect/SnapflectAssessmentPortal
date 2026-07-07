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

        if ($user->hasPermission('Delivery.Sessions.View') || $user->hasPermission('Delivery.Sessions.Proctor') || $user->hasRole('ORGANIZATION_ADMIN') || $user->hasRole('CLIENT_ADMIN')) {
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

        if ($user->hasPermission('Delivery.Sessions.Proctor') || $user->hasRole('PROCTOR') || $user->hasRole('ASSESSMENT_MANAGER') || $user->hasRole('SUPPORT') || $user->hasRole('CLIENT_ADMIN')) {
            return true;
        }

        return false;
    }

    public function terminate(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasPermission('Delivery.Sessions.Proctor') || $user->hasPermission('Delivery.Sessions.Terminate') || $user->hasRole('ORGANIZATION_ADMIN') || $user->hasRole('PROCTOR') || $user->hasRole('ASSESSMENT_MANAGER') || $user->hasRole('SUPPORT') || $user->hasRole('CLIENT_ADMIN')) {
            return true;
        }

        return false;
    }
}
