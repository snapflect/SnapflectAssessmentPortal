const fs = require('fs');
const path = require('path');

const policiesDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'Policies');
if (!fs.existsSync(policiesDir)) {
    fs.mkdirSync(policiesDir, { recursive: true });
}

const writePhpFile = (filename, content) => {
    fs.writeFileSync(path.join(policiesDir, filename), content);
};

const policies = [
    {
        name: 'AssessmentSessionPolicy',
        model: 'AssessmentSession',
        body: `    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $session->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }

    public function resume(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $session->candidate_user_id;
        }

        return false;
    }

    public function terminate(User $user, AssessmentSession $session): bool
    {
        if ($user->organization_id !== $session->organization_id) {
            return false;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }`
    },
    {
        name: 'AssessmentAttemptPolicy',
        model: 'AssessmentAttempt',
        body: `    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, AssessmentAttempt $attempt): bool
    {
        if ($user->organization_id !== $attempt->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return $user->id === $attempt->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }

    public function submit(User $user, AssessmentAttempt $attempt): bool
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

    public function forceExpire(User $user, AssessmentAttempt $attempt): bool
    {
        if ($user->organization_id !== $attempt->organization_id) {
            return false;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }`
    },
    {
        name: 'AttemptQuestionPolicy',
        model: 'AttemptQuestion',
        body: `    public function before(User $user, string $ability): ?bool
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
            return clone $user->id === $question->attempt->candidate_user_id;
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
            return clone $user->id === $question->attempt->candidate_user_id;
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
            return clone $user->id === $question->attempt->candidate_user_id;
        }

        return false;
    }`
    },
    {
        name: 'CandidateAnswerPolicy',
        model: 'CandidateAnswer',
        extraImports: ['use App\\Modules\\Delivery\\Models\\AssessmentAttempt;'],
        body: `    public function before(User $user, string $ability): ?bool
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
            return clone $user->id === $answer->attempt->candidate_user_id;
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
            return clone $user->id === $answer->attempt->candidate_user_id;
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
    }`
    },
    {
        name: 'AttemptSubmissionPolicy',
        model: 'AttemptSubmission',
        body: `    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('PLATFORM_ADMIN')) {
            return true;
        }

        return null;
    }

    public function view(User $user, AttemptSubmission $submission): bool
    {
        if ($user->organization_id !== $submission->organization_id) {
            return false;
        }

        if ($user->hasRole('CANDIDATE')) {
            return clone $user->id === $submission->candidate_user_id;
        }

        if ($user->hasRole('ORGANIZATION_ADMIN')) {
            return true;
        }

        return false;
    }`
    }
];

const template = (policy) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Policies;

use App\\Modules\\Security\\Models\\User;
use App\\Modules\\Delivery\\Models\\${policy.model};
${policy.extraImports ? policy.extraImports.join('\\n') : ''}
use Illuminate\\Auth\\Access\\HandlesAuthorization;

class ${policy.name}
{
    use HandlesAuthorization;

${policy.body.replace(/clone /g, '')}
}
`;

policies.forEach(pol => {
    writePhpFile(`${pol.name}.php`, template(pol));
});

console.log('Sprint 03 Policies generated.');
