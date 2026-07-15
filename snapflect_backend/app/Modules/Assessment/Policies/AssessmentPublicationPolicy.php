<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\AssessmentPublication;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssessmentPublicationPolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability): ?bool
    {
        if ($user->hasRole(['Platform Admin', 'PLATFORM_ADMIN'])) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        // AM must be able to list publications — it's a core part of their workflow
        return $user->hasPermission('Assessment.Publications.View')
            || $user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'Platform Admin', 'PLATFORM_ADMIN', 'READ_ONLY']);
    }

    public function view(User $user, AssessmentPublication $publication): bool
    {
        // Simple logic for MVP. Ideally check org ID matching assessment.
        return true; 
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('Assessment.Publications.Manage')
            || $user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'Platform Admin', 'PLATFORM_ADMIN']);
    }

    public function update(User $user, AssessmentPublication $publication): bool
    {
        return $user->hasPermission('Assessment.Publications.Manage')
            || $user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'Platform Admin', 'PLATFORM_ADMIN']);
    }

    public function delete(User $user, AssessmentPublication $publication): bool
    {
        return $user->hasPermission('Assessment.Publications.Manage')
            || $user->hasRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'Platform Admin', 'PLATFORM_ADMIN']);
    }
}
