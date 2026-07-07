<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ManualScoreReviewResource extends JsonResource
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
            'attributes' => [
                'status' => $this->review_status,
                'awarded_score' => $this->reviewed_score ?? 0,
                'notes' => $this->review_comments,
                'question_text' => $this->whenLoaded('questionScore', function () {
                    return $this->questionScore->question->question_text ?? '';
                }),
                'candidate_answer' => $this->whenLoaded('questionScore', function () {
                    $answer = $this->questionScore->attemptQuestion->answers->first();
                    if (!$answer) return 'No answer provided.';
                    return $answer->text_answer ?? $answer->answer_json ?? $answer->selected_option_uuids_json ?? $answer->selected_option_uuid ?? $answer->numeric_answer ?? 'No answer provided.';
                }),
                'max_score' => $this->whenLoaded('questionScore', function () {
                    return $this->questionScore->max_score ?? 10;
                }),
            ],
            'relationships' => [
                'result' => $this->whenLoaded('assessmentResult', function () {
                    return [
                        'uuid' => $this->assessmentResult->uuid,
                        'relationships' => [
                            'candidate' => [
                                'attributes' => [
                                    'first_name' => $this->assessmentResult->candidate->first_name ?? 'Unknown',
                                    'last_name' => $this->assessmentResult->candidate->last_name ?? 'Candidate'
                                ]
                            ],
                            'assessment' => [
                                'attributes' => [
                                    'title' => $this->assessmentResult->assessment->assessment_name ?? 'Unknown Assessment'
                                ]
                            ]
                        ]
                    ];
                })
            ],
            'timestamps' => [
                'created_date' => $this->whenNotNull($this->created_date ?? null),
                'modified_date' => $this->whenNotNull($this->modified_date ?? null),
                'deleted_date' => $this->whenNotNull($this->deleted_date ?? null),
            ],
        ];
    }
}
