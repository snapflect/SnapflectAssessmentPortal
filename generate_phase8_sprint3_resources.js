const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'Resources');
if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
}

const writePhpFile = (filename, content) => {
    fs.writeFileSync(path.join(resourcesDir, filename), content);
};

const resources = [
    {
        name: 'AssessmentSessionResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'session_status' => $this->session_status,
                'access_started_at' => $this->access_started_at,
                'access_expires_at' => $this->access_expires_at,
                'last_activity_at' => $this->last_activity_at,
            ],
            'relationships' => [
                'attempt' => new AssessmentAttemptResource($this->whenLoaded('attempt')),
                'candidate' => $this->whenLoaded('candidate', fn() => ['uuid' => $this->candidate->uuid]),
                'assessment' => $this->whenLoaded('assessment', fn() => ['uuid' => $this->assessment->uuid]),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }`
    },
    {
        name: 'AssessmentAttemptResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'status' => $this->status,
                'completion_percentage' => $this->completion_percentage,
                'total_questions' => $this->total_questions,
                'answered_questions' => $this->answered_questions,
                'unanswered_questions' => $this->unanswered_questions,
                'flagged_questions' => $this->flagged_questions,
                'remaining_seconds' => $this->remaining_seconds,
                'started_at' => $this->started_at,
                'expires_at' => $this->expires_at,
                'submitted_at' => $this->submitted_at,
            ],
            'relationships' => [
                'sections' => AttemptSectionResource::collection($this->whenLoaded('sections')),
                'questions' => AttemptQuestionResource::collection($this->whenLoaded('questions')),
                'answers' => CandidateAnswerResource::collection($this->whenLoaded('answers')),
                'submission' => new AttemptSubmissionResource($this->whenLoaded('submission')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }`
    },
    {
        name: 'AttemptSectionResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'section_name' => $this->section_name,
                'display_order' => $this->display_order,
                'total_questions' => $this->total_questions,
                'answered_questions' => $this->answered_questions,
                'flagged_questions' => $this->flagged_questions,
                'started_at' => $this->started_at,
                'completed_at' => $this->completed_at,
            ],
            'relationships' => [
                'questions' => AttemptQuestionResource::collection($this->whenLoaded('questions')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }`
    },
    {
        name: 'AttemptQuestionResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'snapshot_question_uuid' => $this->snapshot_question_uuid,
                'question_code' => $this->question_code,
                'question_type' => $this->question_type,
                'difficulty_level' => $this->difficulty_level,
                'display_order' => $this->display_order,
                'max_score' => $this->max_score,
                'is_flagged' => $this->is_flagged,
                'viewed_at' => $this->viewed_at,
                'answered_at' => $this->answered_at,
            ],
            'relationships' => [
                'answers' => CandidateAnswerResource::collection($this->whenLoaded('answers')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }`
    },
    {
        name: 'CandidateAnswerResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'answer_type' => $this->answer_type,
                'selected_option_uuid' => $this->selected_option_uuid,
                'selected_option_uuids_json' => $this->selected_option_uuids_json,
                'text_answer' => $this->text_answer,
                'numeric_answer' => $this->numeric_answer,
                'answer_json' => $this->answer_json,
                'answer_version' => $this->answer_version,
                'is_final_answer' => $this->is_final_answer,
                'saved_at' => $this->saved_at,
            ],
            'relationships' => [
                'question' => new AttemptQuestionResource($this->whenLoaded('question')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }`
    },
    {
        name: 'AttemptEventResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'event_type' => $this->event_type,
                'event_description' => $this->event_description,
                'event_data_json' => $this->event_data_json,
                'event_timestamp' => $this->event_timestamp,
                'ip_address' => $this->when($request->user()?->hasRole('ORGANIZATION_ADMIN') || $request->user()?->hasRole('PLATFORM_ADMIN'), $this->ip_address),
                'user_agent' => $this->when($request->user()?->hasRole('ORGANIZATION_ADMIN') || $request->user()?->hasRole('PLATFORM_ADMIN'), $this->user_agent),
            ],
            'relationships' => [
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }`
    },
    {
        name: 'AttemptAuditResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'entity_name' => $this->entity_name,
                'entity_uuid' => $this->entity_uuid,
                'action_type' => $this->action_type,
                'old_value_json' => $this->old_value_json,
                'new_value_json' => $this->new_value_json,
                'changed_at' => $this->changed_at,
            ],
            'relationships' => [
            ],
            'timestamps' => [
            ],
        ];
    }`
    },
    {
        name: 'AttemptSubmissionResource',
        body: `    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'submission_reference' => $this->submission_reference,
                'submission_type' => $this->submission_type,
                'total_answered' => $this->total_answered,
                'total_unanswered' => $this->total_unanswered,
                'final_duration_seconds' => $this->final_duration_seconds,
                'submitted_at' => $this->submitted_at,
            ],
            'relationships' => [
                'attempt' => new AssessmentAttemptResource($this->whenLoaded('attempt')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }`
    }
];

const template = (res) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Resources;

use Illuminate\\Http\\Resources\\Json\\JsonResource;

class ${res.name} extends JsonResource
{
${res.body}
}
`;

resources.forEach(res => {
    writePhpFile(`${res.name}.php`, template(res));
});

console.log('Sprint 03 Resources generated.');
