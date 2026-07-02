<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Models\AssessmentAttempt;
use Illuminate\Auth\Access\HandlesAuthorization;

class CandidateAnswerPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, CandidateAnswer $answer): bool
    {
        if ($user->organization_id !== $answer->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $answer->attempt->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }

    public function create(User $user, AssessmentAttempt $attempt): bool
    {
        if ($user->organization_id !== $attempt->organization_id) {
            return false;
        }

        if ($attempt->status === 'LOCKED') {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $attempt->candidate_user_id;
        }

        return false;
    }

    public function update(User $user, CandidateAnswer $answer): bool
    {
        if ($user->organization_id !== $answer->organization_id) {
            return false;
        }

        if ($answer->attempt->status === 'LOCKED') {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $answer->attempt->candidate_user_id;
        }

        return false;
    }

    public function autoSave(User $user, AssessmentAttempt $attempt): bool
    {
        if ($user->organization_id !== $attempt->organization_id) {
            return false;
        }

        if ($attempt->status === 'LOCKED') {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $attempt->candidate_user_id;
        }

        return false;
    }
}
