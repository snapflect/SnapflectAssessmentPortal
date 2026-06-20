const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'Policies');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const policies = [
    {
        name: 'AssessmentResultPolicy',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Policies;

use App\\Modules\\Security\\Models\\User;
use App\\Modules\\Results\\Models\\AssessmentResult;
use Illuminate\\Auth\\Access\\HandlesAuthorization;

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
        return $user->hasRole('ORGANIZATION_ADMIN');
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
        return $user->hasRole('ORGANIZATION_ADMIN');
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

        return $user->hasRole('ORGANIZATION_ADMIN');
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

        return $user->hasRole('ORGANIZATION_ADMIN');
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

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function archive(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function viewAudit(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function viewSnapshot(User $user, AssessmentResult $result): bool
    {
        if ($user->organization_id !== $result->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }
}
`
    },
    {
        name: 'ResultPublicationPolicy',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Policies;

use App\\Modules\\Security\\Models\\User;
use App\\Modules\\Results\\Models\\ResultPublication;
use Illuminate\\Auth\\Access\\HandlesAuthorization;

class ResultPublicationPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function publish(User $user, ResultPublication $publication): bool
    {
        if ($user->organization_id !== $publication->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function archive(User $user, ResultPublication $publication): bool
    {
        if ($user->organization_id !== $publication->organization_id) {
            return false;
        }

        return $user->hasRole('ORGANIZATION_ADMIN');
    }

    public function viewPublication(User $user, ResultPublication $publication): bool
    {
        if ($user->organization_id !== $publication->organization_id) {
            return false;
        }

        // Assuming AssessmentResult needs loading or candidate check via nested relationship,
        // but policy rules instruct Candidate: No publication permissions.
        return $user->hasRole('ORGANIZATION_ADMIN');
    }
}
`
    },
    {
        name: 'ManualScoreReviewPolicy',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Policies;

use App\\Modules\\Security\\Models\\User;
use App\\Modules\\Results\\Models\\ManualScoreReview;
use Illuminate\\Auth\\Access\\HandlesAuthorization;

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
`
    }
];

policies.forEach(policy => {
    writePhpFile(path.join(baseDir, `${policy.name}.php`), policy.content);
});

console.log('Sprint 04 Phase 6 Policies generated successfully.');
