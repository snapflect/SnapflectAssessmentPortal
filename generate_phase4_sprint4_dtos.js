const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'DTOs');

if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const dtos = [
    {
        name: 'CalculateResultDto',
        props: `
        public string $attempt_uuid,
        public string $calculation_reason`,
        fromArrayBody: `
        return new self(
            attempt_uuid: $data['attempt_uuid'] ?? '',
            calculation_reason: $data['calculation_reason'] ?? 'Initial calculation'
        );`,
        toArrayBody: `
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'calculation_reason' => $this->calculation_reason,
        ];`
    },
    {
        name: 'RecalculateResultDto',
        props: `
        public string $result_uuid,
        public string $recalculation_reason`,
        fromArrayBody: `
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            recalculation_reason: $data['recalculation_reason'] ?? ''
        );`,
        toArrayBody: `
        return [
            'result_uuid' => $this->result_uuid,
            'recalculation_reason' => $this->recalculation_reason,
        ];`
    },
    {
        name: 'PublishResultDto',
        props: `
        public string $result_uuid,
        public ?string $publication_notes`,
        fromArrayBody: `
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            publication_notes: $data['publication_notes'] ?? null
        );`,
        toArrayBody: `
        $data = [
            'result_uuid' => $this->result_uuid,
            'publication_notes' => $this->publication_notes,
        ];
        return array_filter($data, fn($value) => !is_null($value));`
    },
    {
        name: 'ArchiveResultDto',
        props: `
        public string $result_uuid,
        public ?string $archive_reason`,
        fromArrayBody: `
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            archive_reason: $data['archive_reason'] ?? null
        );`,
        toArrayBody: `
        $data = [
            'result_uuid' => $this->result_uuid,
            'archive_reason' => $this->archive_reason,
        ];
        return array_filter($data, fn($value) => !is_null($value));`
    },
    {
        name: 'CreateManualReviewDto',
        props: `
        public string $result_uuid,
        public string $question_score_uuid,
        public float $reviewed_score,
        public ?string $review_comments`,
        fromArrayBody: `
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            question_score_uuid: $data['question_score_uuid'] ?? '',
            reviewed_score: isset($data['reviewed_score']) ? (float)$data['reviewed_score'] : 0.0,
            review_comments: $data['review_comments'] ?? null
        );`,
        toArrayBody: `
        $data = [
            'result_uuid' => $this->result_uuid,
            'question_score_uuid' => $this->question_score_uuid,
            'reviewed_score' => $this->reviewed_score,
            'review_comments' => $this->review_comments,
        ];
        return array_filter($data, fn($value) => !is_null($value));`
    },
    {
        name: 'UpdateManualReviewDto',
        props: `
        public string $manual_review_uuid,
        public ?string $review_status,
        public ?float $reviewed_score,
        public ?string $review_comments`,
        fromArrayBody: `
        return new self(
            manual_review_uuid: $data['manual_review_uuid'] ?? '',
            review_status: $data['review_status'] ?? null,
            reviewed_score: isset($data['reviewed_score']) ? (float)$data['reviewed_score'] : null,
            review_comments: $data['review_comments'] ?? null
        );`,
        toArrayBody: `
        $data = [
            'manual_review_uuid' => $this->manual_review_uuid,
            'review_status' => $this->review_status,
            'reviewed_score' => $this->reviewed_score,
            'review_comments' => $this->review_comments,
        ];
        // Ensure nulls are stripped for partial updates
        return array_filter($data, fn($value) => !is_null($value));`
    },
    {
        name: 'ResultFilterDto',
        props: `
        public ?string $status,
        public ?string $pass_fail_status,
        public ?string $candidate_uuid,
        public ?string $assessment_uuid,
        public ?int $limit,
        public ?int $offset`,
        fromArrayBody: `
        return new self(
            status: $data['status'] ?? null,
            pass_fail_status: $data['pass_fail_status'] ?? null,
            candidate_uuid: $data['candidate_uuid'] ?? null,
            assessment_uuid: $data['assessment_uuid'] ?? null,
            limit: isset($data['limit']) ? (int)$data['limit'] : null,
            offset: isset($data['offset']) ? (int)$data['offset'] : null
        );`,
        toArrayBody: `
        $data = [
            'status' => $this->status,
            'pass_fail_status' => $this->pass_fail_status,
            'candidate_uuid' => $this->candidate_uuid,
            'assessment_uuid' => $this->assessment_uuid,
            'limit' => $this->limit,
            'offset' => $this->offset,
        ];
        return array_filter($data, fn($value) => !is_null($value));`
    }
];

const template = (dto) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\DTOs;

use App\\Shared\\DTOs\\BaseDto;

readonly class ${dto.name} extends BaseDto
{
    public function __construct(${dto.props}
    ) {}

    public static function fromArray(array $data): static
    {${dto.fromArrayBody}
    }

    public function toArray(): array
    {${dto.toArrayBody}
    }
}
`;

dtos.forEach(dto => {
    writePhpFile(path.join(baseDir, `${dto.name}.php`), template(dto));
});

console.log('Sprint 04 Phase 4 DTOs generated successfully.');
