const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'Repositories');
const interfaceDir = path.join(baseDir, 'Interfaces');
const eloquentDir = path.join(baseDir, 'Eloquent');

if (!fs.existsSync(interfaceDir)) fs.mkdirSync(interfaceDir, { recursive: true });
if (!fs.existsSync(eloquentDir)) fs.mkdirSync(eloquentDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const repos = [
    {
        name: 'AssessmentResult',
        model: 'AssessmentResult',
        relations: `['organization', 'assessment', 'assessmentVersion', 'assessmentSnapshot', 'assessmentAttempt', 'candidate', 'resultVersions', 'questionScores', 'sectionScores', 'competencyScores', 'resultRules', 'resultPublications', 'resultAudits', 'resultSnapshots', 'manualScoreReviews']`,
        additionalInterfaceMethods: `
    public function findPublished(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findByCandidate(int $candidateUserId): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findByAssessment(int $assessmentId): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findReadyForPublication(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findByStatus(string $status): \\Illuminate\\Database\\Eloquent\\Collection;`,
        additionalEloquentMethods: `
    public function findPublished(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('result_status', 'PUBLISHED')->get();
    }

    public function findByCandidate(int $candidateUserId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('candidate_user_id', $candidateUserId)->get();
    }

    public function findByAssessment(int $assessmentId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('assessment_id', $assessmentId)->get();
    }

    public function findReadyForPublication(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('result_status', 'READY')->get();
    }

    public function findByStatus(string $status): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('result_status', $status)->get();
    }`
    },
    {
        name: 'ResultVersion',
        model: 'ResultVersion',
        relations: `['assessmentResult']`,
        additionalInterfaceMethods: `
    public function findCurrentVersion(int $resultId): ?ResultVersion;
    public function findVersions(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection;`,
        additionalEloquentMethods: `
    public function findCurrentVersion(int $resultId): ?ResultVersion
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->where('is_current_version', 1)
            ->first();
    }

    public function findVersions(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->orderBy('version_number', 'desc')
            ->get();
    }`
    },
    {
        name: 'QuestionScore',
        model: 'QuestionScore',
        relations: `['assessmentResult', 'question', 'attemptQuestion']`,
        additionalInterfaceMethods: `
    public function findByResult(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findManualReviewRequired(): \\Illuminate\\Database\\Eloquent\\Collection;`,
        additionalEloquentMethods: `
    public function findByResult(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('assessment_result_id', $resultId)->get();
    }

    public function findManualReviewRequired(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()
            ->where('scoring_type', 'MANUAL')
            ->orWhere('scoring_type', 'HYBRID')
            ->get();
    }`
    },
    {
        name: 'CompetencyScore',
        model: 'CompetencyScore',
        relations: `['assessmentResult', 'competency']`,
        additionalInterfaceMethods: `
    public function findByResult(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findPassedCompetencies(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findFailedCompetencies(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection;`,
        additionalEloquentMethods: `
    public function findByResult(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('assessment_result_id', $resultId)->get();
    }

    public function findPassedCompetencies(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->where('competency_status', 'PASS')
            ->get();
    }

    public function findFailedCompetencies(int $resultId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->where('competency_status', 'FAIL')
            ->get();
    }`
    },
    {
        name: 'ResultPublication',
        model: 'ResultPublication',
        relations: `['assessmentResult', 'publisher']`,
        additionalInterfaceMethods: `
    public function findPublished(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findArchived(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findDrafts(): \\Illuminate\\Database\\Eloquent\\Collection;`,
        additionalEloquentMethods: `
    public function findPublished(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('publication_status', 'PUBLISHED')->get();
    }

    public function findArchived(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('publication_status', 'ARCHIVED')->get();
    }

    public function findDrafts(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('publication_status', 'DRAFT')->get();
    }`
    },
    {
        name: 'ManualScoreReview',
        model: 'ManualScoreReview',
        relations: `['assessmentResult', 'questionScore', 'reviewer']`,
        additionalInterfaceMethods: `
    public function findPending(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findInReview(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findCompleted(): \\Illuminate\\Database\\Eloquent\\Collection;
    public function findByReviewer(int $reviewerId): \\Illuminate\\Database\\Eloquent\\Collection;`,
        additionalEloquentMethods: `
    public function findPending(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('review_status', 'PENDING')->get();
    }

    public function findInReview(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('review_status', 'IN_REVIEW')->get();
    }

    public function findCompleted(): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('review_status', 'COMPLETED')->get();
    }

    public function findByReviewer(int $reviewerId): \\Illuminate\\Database\\Eloquent\\Collection
    {
        return $this->query()->where('reviewed_by', $reviewerId)->get();
    }`
    }
];

const interfaceTemplate = (repo) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Repositories\\Interfaces;

use App\\Modules\\Results\\Models\\${repo.model};
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Contracts\\Pagination\\LengthAwarePaginator;
use Illuminate\\Database\\Eloquent\\Collection;

interface ${repo.name}RepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?${repo.model};
    public function findByUuid(string $uuid): ?${repo.model};
    public function findByUuidWithRelations(string $uuid): ?${repo.model};
    public function findWithTrashed(int $id): ?${repo.model};
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;${repo.additionalInterfaceMethods}
}
`;

const eloquentTemplate = (repo) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Repositories\\Eloquent;

use App\\Modules\\Results\\Models\\${repo.model};
use App\\Modules\\Results\\Repositories\\Interfaces\\${repo.name}RepositoryInterface;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Contracts\\Pagination\\LengthAwarePaginator;
use Illuminate\\Database\\Eloquent\\Collection;

/**
 * Class ${repo.name}Repository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class ${repo.name}Repository implements ${repo.name}RepositoryInterface
{
    public function query(): Builder
    {
        return ${repo.model}::query();
    }

    public function findById(int $id): ?${repo.model}
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?${repo.model}
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?${repo.model}
    {
        return $this->query()
            ->with(${repo.relations})
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?${repo.model}
    {
        // Mutable models support soft deletes conceptually by is_deleted flags if not using Laravel SoftDeletes trait.
        // Assuming custom is_deleted implementation based on Schema:
        return $this->query()->withoutGlobalScope('active')->find($id);
    }

    public function findOnlyTrashed(): Collection
    {
        return $this->query()->withoutGlobalScope('active')->where('is_deleted', 1)->get();
    }

    public function paginateByOrganization(int $organizationId): LengthAwarePaginator
    {
        return $this->query()->where('organization_id', $organizationId)->paginate();
    }

    public function search(string $term): Collection
    {
        // Simple search abstraction
        return $this->query()
            ->where('uuid', 'LIKE', "%{$term}%")
            ->get();
    }${repo.additionalEloquentMethods}
}
`;

repos.forEach(repo => {
    writePhpFile(path.join(interfaceDir, `${repo.name}RepositoryInterface.php`), interfaceTemplate(repo));
    writePhpFile(path.join(eloquentDir, `${repo.name}Repository.php`), eloquentTemplate(repo));
});

console.log('Sprint 04 Phase 3 Repositories generated successfully.');
