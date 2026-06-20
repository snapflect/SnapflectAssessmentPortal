const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'Repositories');
const interfacesDir = path.join(baseDir, 'Interfaces');
const eloquentDir = path.join(baseDir, 'Eloquent');

[interfacesDir, eloquentDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const writeRepo = (dir, filename, content) => {
    fs.writeFileSync(path.join(dir, filename), content);
};

const repos = [
    {
        name: 'AssessmentSession',
        model: 'AssessmentSession',
        methods: [
            'public function findById(int $id): ?AssessmentSession;',
            'public function findByUuid(string $uuid): ?AssessmentSession;',
            'public function findByIdWithRelations(int $id, array $relations): ?AssessmentSession;',
            'public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentSession;',
            'public function findWithTrashed(int $id): ?AssessmentSession;',
            'public function findOnlyTrashed(int $id): ?AssessmentSession;',
            'public function findBySessionToken(string $token): ?AssessmentSession;',
            'public function findActiveSessionByCandidate(int $organizationId, int $candidateId): ?AssessmentSession;',
            'public function findExpiredSessions(): Collection;',
            'public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;',
            'public function query(): Builder;',
            'public function create(array $data): AssessmentSession;',
            'public function update(AssessmentSession $session, array $data): bool;'
        ],
        eloquentMethods: `    public function findById(int $id): ?AssessmentSession
    {
        return AssessmentSession::find($id);
    }

    public function findByUuid(string $uuid): ?AssessmentSession
    {
        return AssessmentSession::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AssessmentSession
    {
        return AssessmentSession::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentSession
    {
        return AssessmentSession::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?AssessmentSession
    {
        return AssessmentSession::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?AssessmentSession
    {
        return AssessmentSession::onlyTrashed()->find($id);
    }

    public function findBySessionToken(string $token): ?AssessmentSession
    {
        return AssessmentSession::where('session_token', $token)->first();
    }

    public function findActiveSessionByCandidate(int $organizationId, int $candidateId): ?AssessmentSession
    {
        return AssessmentSession::where('organization_id', $organizationId)
            ->where('candidate_user_id', $candidateId)
            ->where('session_status', 'ACTIVE')
            ->first();
    }

    public function findExpiredSessions(): Collection
    {
        return AssessmentSession::where('access_expires_at', '<', now())
            ->where('session_status', 'ACTIVE')
            ->get();
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return AssessmentSession::where('organization_id', $organizationId)->paginate($perPage);
    }

    public function query(): Builder
    {
        return AssessmentSession::query();
    }

    public function create(array $data): AssessmentSession
    {
        return AssessmentSession::create($data);
    }

    public function update(AssessmentSession $session, array $data): bool
    {
        return $session->update($data);
    }`
    },
    {
        name: 'AssessmentAttempt',
        model: 'AssessmentAttempt',
        methods: [
            'public function findById(int $id): ?AssessmentAttempt;',
            'public function findByUuid(string $uuid): ?AssessmentAttempt;',
            'public function findByIdWithRelations(int $id, array $relations): ?AssessmentAttempt;',
            'public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentAttempt;',
            'public function findWithTrashed(int $id): ?AssessmentAttempt;',
            'public function findOnlyTrashed(int $id): ?AssessmentAttempt;',
            'public function findActiveAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt;',
            'public function findSubmittedAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt;',
            'public function findExpiredAttempts(): Collection;',
            'public function findBySnapshot(int $snapshotId): Collection;',
            'public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;',
            'public function query(): Builder;',
            'public function create(array $data): AssessmentAttempt;',
            'public function update(AssessmentAttempt $attempt, array $data): bool;'
        ],
        eloquentMethods: `    public function findById(int $id): ?AssessmentAttempt
    {
        return AssessmentAttempt::find($id);
    }

    public function findByUuid(string $uuid): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AssessmentAttempt
    {
        return AssessmentAttempt::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentAttempt
    {
        return AssessmentAttempt::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?AssessmentAttempt
    {
        return AssessmentAttempt::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?AssessmentAttempt
    {
        return AssessmentAttempt::onlyTrashed()->find($id);
    }

    public function findActiveAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('organization_id', $organizationId)
            ->where('candidate_user_id', $candidateId)
            ->where('assessment_version_id', $assessmentVersionId)
            ->whereIn('status', ['NOT_STARTED', 'IN_PROGRESS'])
            ->first();
    }

    public function findSubmittedAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('organization_id', $organizationId)
            ->where('candidate_user_id', $candidateId)
            ->where('assessment_version_id', $assessmentVersionId)
            ->where('status', 'SUBMITTED')
            ->first();
    }

    public function findExpiredAttempts(): Collection
    {
        return AssessmentAttempt::where('expires_at', '<', now())
            ->whereIn('status', ['NOT_STARTED', 'IN_PROGRESS'])
            ->get();
    }

    public function findBySnapshot(int $snapshotId): Collection
    {
        return AssessmentAttempt::where('assessment_snapshot_id', $snapshotId)->get();
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return AssessmentAttempt::where('organization_id', $organizationId)->paginate($perPage);
    }

    public function query(): Builder
    {
        return AssessmentAttempt::query();
    }

    public function create(array $data): AssessmentAttempt
    {
        return AssessmentAttempt::create($data);
    }

    public function update(AssessmentAttempt $attempt, array $data): bool
    {
        return $attempt->update($data);
    }`
    },
    {
        name: 'AttemptQuestion',
        model: 'AttemptQuestion',
        methods: [
            'public function findById(int $id): ?AttemptQuestion;',
            'public function findByUuid(string $uuid): ?AttemptQuestion;',
            'public function findByIdWithRelations(int $id, array $relations): ?AttemptQuestion;',
            'public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptQuestion;',
            'public function findWithTrashed(int $id): ?AttemptQuestion;',
            'public function findOnlyTrashed(int $id): ?AttemptQuestion;',
            'public function findByAttempt(int $attemptId): Collection;',
            'public function findBySection(int $sectionId): Collection;',
            'public function paginateByAttempt(int $attemptId, int $perPage = 15): LengthAwarePaginator;',
            'public function query(): Builder;',
            'public function create(array $data): AttemptQuestion;',
            'public function update(AttemptQuestion $question, array $data): bool;'
        ],
        eloquentMethods: `    public function findById(int $id): ?AttemptQuestion
    {
        return AttemptQuestion::find($id);
    }

    public function findByUuid(string $uuid): ?AttemptQuestion
    {
        return AttemptQuestion::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AttemptQuestion
    {
        return AttemptQuestion::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptQuestion
    {
        return AttemptQuestion::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?AttemptQuestion
    {
        return AttemptQuestion::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?AttemptQuestion
    {
        return AttemptQuestion::onlyTrashed()->find($id);
    }

    public function findByAttempt(int $attemptId): Collection
    {
        return AttemptQuestion::where('assessment_attempt_id', $attemptId)->orderBy('display_order')->get();
    }

    public function findBySection(int $sectionId): Collection
    {
        return AttemptQuestion::where('attempt_section_id', $sectionId)->orderBy('display_order')->get();
    }

    public function paginateByAttempt(int $attemptId, int $perPage = 15): LengthAwarePaginator
    {
        return AttemptQuestion::where('assessment_attempt_id', $attemptId)->orderBy('display_order')->paginate($perPage);
    }

    public function query(): Builder
    {
        return AttemptQuestion::query();
    }

    public function create(array $data): AttemptQuestion
    {
        return AttemptQuestion::create($data);
    }

    public function update(AttemptQuestion $question, array $data): bool
    {
        return $question->update($data);
    }`
    },
    {
        name: 'CandidateAnswer',
        model: 'CandidateAnswer',
        methods: [
            'public function findById(int $id): ?CandidateAnswer;',
            'public function findByUuid(string $uuid): ?CandidateAnswer;',
            'public function findByIdWithRelations(int $id, array $relations): ?CandidateAnswer;',
            'public function findByUuidWithRelations(string $uuid, array $relations): ?CandidateAnswer;',
            'public function findWithTrashed(int $id): ?CandidateAnswer;',
            'public function findOnlyTrashed(int $id): ?CandidateAnswer;',
            'public function findByAttempt(int $attemptId): Collection;',
            'public function findByQuestion(int $questionId): Collection;',
            'public function findLatestAnswer(int $attemptId, int $questionId): ?CandidateAnswer;',
            'public function create(array $data): CandidateAnswer;',
            'public function update(CandidateAnswer $answer, array $data): bool;',
            'public function query(): Builder;'
        ],
        eloquentMethods: `    public function findById(int $id): ?CandidateAnswer
    {
        return CandidateAnswer::find($id);
    }

    public function findByUuid(string $uuid): ?CandidateAnswer
    {
        return CandidateAnswer::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?CandidateAnswer
    {
        return CandidateAnswer::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?CandidateAnswer
    {
        return CandidateAnswer::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?CandidateAnswer
    {
        return CandidateAnswer::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?CandidateAnswer
    {
        return CandidateAnswer::onlyTrashed()->find($id);
    }

    public function findByAttempt(int $attemptId): Collection
    {
        return CandidateAnswer::where('assessment_attempt_id', $attemptId)->get();
    }

    public function findByQuestion(int $questionId): Collection
    {
        return CandidateAnswer::where('attempt_question_id', $questionId)->get();
    }

    public function findLatestAnswer(int $attemptId, int $questionId): ?CandidateAnswer
    {
        return CandidateAnswer::where('assessment_attempt_id', $attemptId)
            ->where('attempt_question_id', $questionId)
            ->orderByDesc('answer_version')
            ->first();
    }

    public function create(array $data): CandidateAnswer
    {
        return CandidateAnswer::create($data);
    }

    public function update(CandidateAnswer $answer, array $data): bool
    {
        return $answer->update($data);
    }

    public function query(): Builder
    {
        return CandidateAnswer::query();
    }`
    },
    {
        name: 'AttemptEvent',
        model: 'AttemptEvent',
        methods: [
            'public function createEvent(array $data): AttemptEvent;',
            'public function getAttemptTimeline(int $attemptId): Collection;',
            'public function getEventsByType(int $attemptId, string $eventType): Collection;',
            'public function query(): Builder;'
        ],
        eloquentMethods: `    public function createEvent(array $data): AttemptEvent
    {
        return AttemptEvent::create($data);
    }

    public function getAttemptTimeline(int $attemptId): Collection
    {
        return AttemptEvent::where('assessment_attempt_id', $attemptId)
            ->orderBy('event_timestamp', 'asc')
            ->get();
    }

    public function getEventsByType(int $attemptId, string $eventType): Collection
    {
        return AttemptEvent::where('assessment_attempt_id', $attemptId)
            ->where('event_type', $eventType)
            ->orderBy('event_timestamp', 'asc')
            ->get();
    }

    public function query(): Builder
    {
        return AttemptEvent::query();
    }`
    },
    {
        name: 'AttemptSubmission',
        model: 'AttemptSubmission',
        methods: [
            'public function findById(int $id): ?AttemptSubmission;',
            'public function findByUuid(string $uuid): ?AttemptSubmission;',
            'public function findByIdWithRelations(int $id, array $relations): ?AttemptSubmission;',
            'public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptSubmission;',
            'public function findByAttempt(int $attemptId): ?AttemptSubmission;',
            'public function create(array $data): AttemptSubmission;',
            'public function query(): Builder;'
        ],
        eloquentMethods: `    public function findById(int $id): ?AttemptSubmission
    {
        return AttemptSubmission::find($id);
    }

    public function findByUuid(string $uuid): ?AttemptSubmission
    {
        return AttemptSubmission::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AttemptSubmission
    {
        return AttemptSubmission::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptSubmission
    {
        return AttemptSubmission::with($relations)->where('uuid', $uuid)->first();
    }

    public function findByAttempt(int $attemptId): ?AttemptSubmission
    {
        return AttemptSubmission::where('assessment_attempt_id', $attemptId)->first();
    }

    public function create(array $data): AttemptSubmission
    {
        return AttemptSubmission::create($data);
    }

    public function query(): Builder
    {
        return AttemptSubmission::query();
    }`
    }
];

const interfaceTemplate = (name, methods, modelName) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Repositories\\Interfaces;

use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Support\\Collection;
use Illuminate\\Pagination\\LengthAwarePaginator;
use App\\Modules\\Delivery\\Models\\${modelName};

interface ${name}RepositoryInterface
{
${methods.map(m => '    ' + m).join('\\n')}
}
`;

const eloquentTemplate = (name, methods, modelName) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Repositories\\Eloquent;

use App\\Modules\\Delivery\\Repositories\\Interfaces\\${name}RepositoryInterface;
use App\\Modules\\Delivery\\Models\\${modelName};
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Support\\Collection;
use Illuminate\\Pagination\\LengthAwarePaginator;

class ${name}Repository implements ${name}RepositoryInterface
{
${methods}
}
`;

repos.forEach(repo => {
    writeRepo(interfacesDir, repo.name + 'RepositoryInterface.php', interfaceTemplate(repo.name, repo.methods, repo.model));
    writeRepo(eloquentDir, repo.name + 'Repository.php', eloquentTemplate(repo.name, repo.eloquentMethods, repo.model));
});

console.log('Sprint 03 Repositories generated.');
