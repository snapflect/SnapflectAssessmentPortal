const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'Resources');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const resources = [
    {
        name: 'AssessmentResultResource',
        attributes: `
            'result_reference' => $this->result_reference,
            'result_version' => $this->result_version,
            'overall_score' => $this->overall_score,
            'overall_percentage' => $this->overall_percentage,
            'pass_fail_status' => $this->pass_fail_status,
            'result_status' => $this->result_status,
            'published_at' => $this->published_at,`,
        relationships: `
            'question_scores' => QuestionScoreResource::collection($this->whenLoaded('questionScores')),
            'section_scores' => SectionScoreResource::collection($this->whenLoaded('sectionScores')),
            'competency_scores' => CompetencyScoreResource::collection($this->whenLoaded('competencyScores')),
            'publications' => ResultPublicationResource::collection($this->whenLoaded('resultPublications')),`
    },
    {
        name: 'QuestionScoreResource',
        attributes: `
            'max_score' => $this->max_score,
            'awarded_score' => $this->awarded_score,
            'percentage' => $this->percentage,
            'scoring_type' => $this->scoring_type,`,
        relationships: ``
    },
    {
        name: 'SectionScoreResource',
        attributes: `
            'section_score' => $this->section_score,
            'section_percentage' => $this->section_percentage,
            'section_weight' => $this->section_weight,`,
        relationships: ``
    },
    {
        name: 'CompetencyScoreResource',
        attributes: `
            'competency_score' => $this->competency_score,
            'competency_percentage' => $this->competency_percentage,
            'threshold_score' => $this->threshold_score,
            'competency_status' => $this->competency_status,`,
        relationships: ``
    },
    {
        name: 'ResultPublicationResource',
        attributes: `
            'publication_status' => $this->publication_status,
            'published_at' => $this->published_at,
            'archived_at' => $this->archived_at,
            'publication_notes' => $this->publication_notes,`,
        relationships: ``
    },
    {
        name: 'ManualScoreReviewResource',
        attributes: `
            'review_status' => $this->review_status,
            'original_score' => $this->original_score,
            'reviewed_score' => $this->reviewed_score,
            'review_comments' => $this->review_comments,
            'reviewed_at' => $this->reviewed_at,`,
        relationships: ``
    },
    {
        name: 'ResultAuditResource',
        attributes: `
            'audit_type' => $this->audit_type,
            'audit_description' => $this->audit_description,
            'performed_at' => $this->performed_at,`,
        relationships: ``
    },
    {
        name: 'ResultSnapshotResource',
        attributes: `
            'snapshot_hash' => $this->snapshot_hash,
            'calculated_at' => $this->calculated_at,`,
        relationships: ``
    }
];

const template = (res) => {
    // Only immutable tables lack timestamps (like created_date), though audit/snapshot have performed_at/calculated_at.
    // The prompt specifies a uniform block for created_date, modified_date, deleted_date "Only when present."
    
    return `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class ${res.name} extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [${res.attributes}
            ],
            'relationships' => [${res.relationships}
            ],
            'timestamps' => [
                'created_date' => $this->whenNotNull($this->created_date ?? null),
                'modified_date' => $this->whenNotNull($this->modified_date ?? null),
                'deleted_date' => $this->whenNotNull($this->deleted_date ?? null),
            ],
        ];
    }
}
`;
};

resources.forEach(res => {
    writePhpFile(path.join(baseDir, `${res.name}.php`), template(res));
});

console.log('Sprint 04 Phase 8 Resources generated successfully.');
