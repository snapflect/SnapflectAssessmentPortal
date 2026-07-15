<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Policies;

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\QuestionBank;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuestionBankPolicy
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
        return $user->hasPermission('Assessment.QuestionBanks.View') || $user->hasPermission('Assessment.QuestionBanks.Manage') || $user->hasPermission('Assessment.Questions.View');
    }

    public function view(User $user, QuestionBank $questionBank): bool
    {
        if (!($user->hasPermission('Assessment.QuestionBanks.View') || $user->hasPermission('Assessment.QuestionBanks.Manage') || $user->hasPermission('Assessment.Questions.View'))) {
            return false;
        }
        return $user->canAccessPlacement($questionBank) || $questionBank->is_system_bank;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('Assessment.QuestionBanks.Manage');
    }

    public function update(User $user, QuestionBank $questionBank): bool
    {
        if (!$user->hasPermission('Assessment.QuestionBanks.Manage')) {
            return false;
        }
        return $user->canAccessPlacement($questionBank);
    }

    public function delete(User $user, QuestionBank $questionBank): bool
    {
        if (!$user->hasPermission('Assessment.QuestionBanks.Manage')) {
            return false;
        }
        return $user->canAccessPlacement($questionBank);
    }
}
