<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentAttemptResource extends JsonResource
{
    public function toArray($request): array
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
    }
}
