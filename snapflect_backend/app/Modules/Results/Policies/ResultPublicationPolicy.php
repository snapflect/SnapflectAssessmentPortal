<?php

declare(strict_types=1);

namespace App\Modules\Results\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Results\Models\ResultPublication;
use Illuminate\Auth\Access\HandlesAuthorization;

class ResultPublicationPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function publish(User $user, ResultPublication $publication): bool
    {
        if ($user->organization_id !== $publication->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function archive(User $user, ResultPublication $publication): bool
    {
        if ($user->organization_id !== $publication->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function viewPublication(User $user, ResultPublication $publication): bool
    {
        if ($user->organization_id !== $publication->organization_id) {
            return false;
        }

        // Assuming AssessmentResult needs loading or candidate check via nested relationship,
        // but policy rules instruct Candidate: No publication permissions.
        return $user->hasRole('ORGANIZATION_ADMIN');
    }
}
