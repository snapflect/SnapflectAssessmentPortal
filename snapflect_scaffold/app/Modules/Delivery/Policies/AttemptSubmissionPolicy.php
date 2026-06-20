<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\AttemptSubmission;

use Illuminate\Auth\Access\HandlesAuthorization;

class AttemptSubmissionPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, AttemptSubmission $submission): bool
    {
        if ($user->organization_id !== $submission->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $submission->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }
}
