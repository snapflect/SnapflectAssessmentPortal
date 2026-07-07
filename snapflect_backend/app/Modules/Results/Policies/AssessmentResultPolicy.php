<?php

declare(strict_types=1);

namespace App\Modules\Results\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Results\Models\AssessmentResult;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssessmentResultPolicy
{
    use HandlesAuthorization;

    /**
     * PLATFORM ADMIN OVERRIDE
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        // Platform Admin overrides this. Others evaluate conditionally.
        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER', 'READ_ONLY']);
    }

    public function view(User $user, AssessmentResult $result): bool
    {
        // TENANT BOUNDARY RULE
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        // CANDIDATE ACCESS RULE
        if ($user->id === $result->candidate_user_id) {
            return true;
        }

        // ORGANIZATION ADMIN ACCESS
        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER']);
    }

    public function calculate(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        // IMMUTABILITY RULE
        if ($result->result_status === 'PUBLISHED' || $result->result_status === 'ARCHIVED') {
            return false;
        }

        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
    }

    public function recalculate(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        // IMMUTABILITY RULE
        if ($result->result_status === 'PUBLISHED' || $result->result_status === 'ARCHIVED') {
            return false;
        }

        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
    }

    public function publish(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        // IMMUTABILITY RULE
        if ($result->result_status === 'PUBLISHED' || $result->result_status === 'ARCHIVED') {
            return false;
        }

        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
    }

    public function archive(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
    }

    public function viewAudit(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
    }

    public function viewSnapshot(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        return $user->hasRole(['ORGANIZATION_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
    }
}
