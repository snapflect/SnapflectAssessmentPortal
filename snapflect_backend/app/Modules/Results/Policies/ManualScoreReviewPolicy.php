<?php

declare(strict_types=1);

namespace App\Modules\Results\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Results\Models\ManualScoreReview;
use Illuminate\Auth\Access\HandlesAuthorization;

class ManualScoreReviewPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('ORGANIZATION_ADMIN') || $user->hasRole('EVALUATOR');
    }

    public function view(User $user, ManualScoreReview $review): bool
    {
        if ($user->organization_id !== $review->organization_id) {
            return false;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN') || $user->hasRole('EVALUATOR')) {
            return true;
        }

        // CANDIDATE Read-only if review belongs to own result
        // Requires loading the related assessmentResult safely
        $result = $review->assessmentResult;
        if ($result && $user->id === $result->candidate_user_id) {
            return true;
        }

        return false;
    }

    public function create(User $user, ManualScoreReview $review): bool
    {
        if ($user->organization_id !== $review->organization_id) {
            return false;
        }

        // Determine if result is published - load safe
        $result = $review->assessmentResult;
        if ($result && ($result->result_status === 'PUBLISHED' || $result->result_status === 'ARCHIVED')) {
            return false; // Immutability Rule
        }

        return $user->hasRole('ORGANIZATION_ADMIN') || $user->hasRole('EVALUATOR');
    }

    public function update(User $user, ManualScoreReview $review): bool
    {
        if ($user->organization_id !== $review->organization_id) {
            return false;
        }

        $result = $review->assessmentResult;
        if ($result && ($result->result_status === 'PUBLISHED' || $result->result_status === 'ARCHIVED')) {
            return false; // Immutability Rule
        }

        return $user->hasRole('ORGANIZATION_ADMIN') || $user->hasRole('EVALUATOR');
    }
}
