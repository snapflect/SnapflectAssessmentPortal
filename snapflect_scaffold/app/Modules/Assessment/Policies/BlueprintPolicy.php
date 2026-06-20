<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\AssessmentBlueprint;
use Illuminate\Auth\Access\HandlesAuthorization;

class BlueprintPolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability): ?bool
    {
        if ($user->hasRole('Platform Admin')) {
            return true;
        }
        return null;
    }

    public function view(User $user, AssessmentBlueprint $blueprint): bool
    {
        if (!$user->hasRole(['Organization Admin', 'Department Manager'])) {
            return false;
        }
        return $user->organization_id === $blueprint->organization_id;
    }

    public function update(User $user, AssessmentBlueprint $blueprint): bool
    {
        if (!$user->hasRole(['Organization Admin', 'Department Manager'])) {
            return false;
        }
        if ($user->organization_id !== $blueprint->organization_id) {
            return false;
        }

        // Must load assessment to check state
        $state = $blueprint->assessment->current_state ?? null;
        if ($state === 'PUBLISHED' || $state === 'ARCHIVED') {
            return false;
        }
        
        return $state === 'DRAFT' || $state === 'IN_REVIEW';
    }
}
