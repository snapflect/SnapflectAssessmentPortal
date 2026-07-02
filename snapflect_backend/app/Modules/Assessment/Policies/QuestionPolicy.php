<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Question;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuestionPolicy
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
        return $user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER']);
    }

    public function view(User $user, Question $question): bool
    {
        if (!$user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER'])) {
            return false;
        }
        return $user->organization_id === $question->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER']);
    }

    public function update(User $user, Question $question): bool
    {
        if (!$user->hasRole(['ORG_ADMIN', 'DEPT_MANAGER'])) {
            return false;
        }
        return $user->organization_id === $question->organization_id;
    }

    public function delete(User $user, Question $question): bool
    {
        if (!$user->hasRole('ORG_ADMIN')) {
            return false;
        }
        return $user->organization_id === $question->organization_id;
    }
}
