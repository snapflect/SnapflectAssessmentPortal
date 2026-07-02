<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\AttemptQuestion;

use Illuminate\Auth\Access\HandlesAuthorization;

class AttemptQuestionPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, AttemptQuestion $question): bool
    {
        if ($user->organization_id !== $question->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $question->attempt->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }

    public function flag(User $user, AttemptQuestion $question): bool
    {
        if ($user->organization_id !== $question->organization_id) {
            return false;
        }

        if ($question->attempt->status === 'LOCKED') {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $question->attempt->candidate_user_id;
        }

        return false;
    }

    public function unflag(User $user, AttemptQuestion $question): bool
    {
        if ($user->organization_id !== $question->organization_id) {
            return false;
        }

        if ($question->attempt->status === 'LOCKED') {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $question->attempt->candidate_user_id;
        }

        return false;
    }
}
