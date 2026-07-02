<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Modules\Delivery\Models\SessionStateMachine;

class CandidateAssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $publication = $this->whenLoaded('assessment', function () {
            return $this->assessment->activePublication;
        });

        // Compute publication dynamic status if available
        $pubStatus = 'SCHEDULED';
        if ($publication) {
            $pubStatus = $publication->status;
            $now = now();
            if ($pubStatus === 'SCHEDULED' || $pubStatus === 'ACTIVE') {
                if ($publication->end_date && $now->greaterThan($publication->end_date)) {
                    $pubStatus = 'COMPLETED';
                } elseif ($publication->start_date && $now->greaterThanOrEqualTo($publication->start_date)) {
                    $pubStatus = 'ACTIVE';
                } else {
                    $pubStatus = 'SCHEDULED';
                }
            }
        }

        $attempt = $this->whenLoaded('attempt');
        
        $isCompleted = false;
        $isPassed = false;
        $score = null;
        $attemptsUsed = $attempt ? 1 : 0; // Simple logic: if attempt exists, they used 1 attempt
        
        if ($attempt) {
            if ($attempt->attempt_status === 'COMPLETED' || $attempt->attempt_status === 'EXPIRED') {
                $isCompleted = true;
                $score = $attempt->score_percentage ?? 0;
                $isPassed = $attempt->is_passed ?? false;
            }
        }

        $maxAttempts = $publication ? $publication->max_attempts : 1;
        $attemptsRemaining = max(0, $maxAttempts - $attemptsUsed);

        // Derive overall status
        // If completed an attempt and passed, or used all attempts -> COMPLETED
        // If no attempt but publication is ACTIVE -> ACTIVE
        // If publication is SCHEDULED -> SCHEDULED
        // If publication is COMPLETED/CANCELLED -> COMPLETED
        $overallStatus = $pubStatus;
        if ($isCompleted) {
            if ($isPassed || $attemptsRemaining <= 0) {
                $overallStatus = 'COMPLETED';
            } else if ($pubStatus === 'ACTIVE') {
                $overallStatus = 'ACTIVE';
            }
        }

        return [
            'uuid' => $this->uuid, // session uuid
            'attributes' => [
                'title' => $publication ? $publication->title : ($this->assessment ? $this->assessment->assessment_name : 'Assessment'),
                'publication_code' => $publication ? $publication->publication_code : 'N/A',
                'status' => $overallStatus,
                'start_date' => $publication ? $publication->start_date : $this->created_date,
                'end_date' => $publication ? $publication->end_date : null,
                'max_attempts' => $maxAttempts,
                'is_proctored' => $publication ? $publication->is_proctored : false,
                'duration_minutes' => $this->assessment ? $this->assessment->estimated_duration_minutes : null,
            ],
            'relationships' => [
                'assessment' => [
                    'attributes' => [
                        'title' => $this->assessment ? $this->assessment->assessment_name : '',
                        'pass_marks' => $this->assessment ? $this->assessment->pass_percentage : 0,
                        'total_marks' => $this->assessment ? $this->assessment->total_marks : 0,
                    ]
                ]
            ],
            'meta' => [
                'attempts_used' => $attemptsUsed,
                'attempts_remaining' => $attemptsRemaining,
                'best_score' => $score,
                'is_passed' => $isPassed,
            ]
        ];
    }
}
