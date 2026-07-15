<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\AssessmentBlueprint;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssessmentBlueprintPolicy
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
        // Allow access to view any blueprints if they are an authoring role
        return $user->hasRole(['CLIENT_ADMIN', 'DEPT_MANAGER', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER', 'READ_ONLY']);
    }

    public function view(User $user, AssessmentBlueprint $blueprint): bool
    {
        if (!$user->hasRole(['CLIENT_ADMIN', 'DEPT_MANAGER', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER', 'READ_ONLY'])) {
            return false;
        }
        return $user->organization_id === $blueprint->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['CLIENT_ADMIN', 'DEPT_MANAGER', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR']);
    }

    public function update(User $user, AssessmentBlueprint $blueprint): bool
    {
        if (!$user->hasRole(['CLIENT_ADMIN', 'DEPT_MANAGER', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR'])) {
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
