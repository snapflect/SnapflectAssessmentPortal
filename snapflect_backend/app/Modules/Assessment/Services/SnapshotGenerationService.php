<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Exceptions\SessionLaunchException;
use Illuminate\Support\Str;

class SnapshotGenerationService
{
    public function generate(Assessment $assessment, int $userId): AssessmentSnapshot
    {
        // 1. Eager load everything necessary for the snapshot
        $assessment->load([
            'blueprint.sections.sectionQuestions.question.options',
            'blueprint.sections.sectionQuestions.question.competencies'
        ]);

        // 2. Build the Snapshot JSON payload
        $snapshotData = [
            'assessment_uuid' => $assessment->uuid,
            'assessment_title' => $assessment->assessment_name,
            'assessment_version' => $assessment->version ? $assessment->version->version_number : 1,
            'assessment_current_state' => $assessment->current_state,
            'assessment_publication_timestamp' => $assessment->published_date ?? now()->toIso8601String(),
            'blueprint' => null
        ];

        if ($assessment->blueprint) {
            $blueprintData = [
                'uuid' => $assessment->blueprint->uuid,
                'version' => $assessment->blueprint->version ?? 1,
                'sections' => []
            ];

            foreach ($assessment->blueprint->sections as $section) {
                $sectionData = [
                    'uuid' => $section->uuid,
                    'section_name' => $section->section_name,
                    'section_weight' => $section->section_weight,
                    'section_ordering' => $section->display_order ?? 0,
                    'questions' => []
                ];

                foreach ($section->sectionQuestions as $sq) {
                    $q = $sq->question;
                    if (!$q) continue;

                    $questionData = [
                        'uuid' => $q->uuid,
                        'version' => $q->version ?? 1,
                        'question_type' => $q->question_type,
                        'question_weight' => $sq->weight ?? 1,
                        'question_text' => $q->question_text,
                        'question_ordering' => $sq->display_order ?? 0,
                        'options' => [],
                        'competencies' => []
                    ];

                    foreach ($q->options as $opt) {
                        $questionData['options'][] = [
                            'uuid' => $opt->uuid,
                            'option_text' => $opt->option_text,
                            'is_correct' => $opt->is_correct,
                            'display_order' => $opt->display_order ?? 0,
                        ];
                    }

                    foreach ($q->competencies as $comp) {
                        $questionData['competencies'][] = [
                            'uuid' => $comp->uuid,
                            'competency_name' => $comp->competency_name
                        ];
                    }

                    $sectionData['questions'][] = $questionData;
                }

                $blueprintData['sections'][] = $sectionData;
            }

            $snapshotData['blueprint'] = $blueprintData;
        }

        $snapshotData['passing_threshold'] = $assessment->pass_percentage;
        $snapshotData['scoring_metadata'] = [
            'total_marks' => $assessment->total_marks,
            'duration_minutes' => $assessment->estimated_duration_minutes
        ];

        $jsonPayload = json_encode($snapshotData);
        if ($jsonPayload === false) {
            throw new SessionLaunchException(SessionLaunchException::SNAPSHOT_GENERATION_FAILED, "Failed to encode snapshot JSON.");
        }

        $hash = hash('sha256', $jsonPayload);

        // 3. Persist Snapshot
        $snapshot = new AssessmentSnapshot();
        $snapshot->uuid = Str::uuid()->toString();
        $snapshot->organization_id = $assessment->organization_id;
        $snapshot->assessment_id = $assessment->id;
        $snapshot->assessment_version_id = $assessment->versions()->latest()->first()->id ?? 1; // Fallback to 1 if no version system properly seeded yet
        $snapshot->snapshot_json = $jsonPayload;
        $snapshot->snapshot_hash = $hash;
        $snapshot->snapshot_schema_version = '1.0';
        $snapshot->published_by = $userId;
        $snapshot->published_date = now();
        $snapshot->status = 'ACTIVE';
        $snapshot->created_by = $userId;
        $snapshot->save();

        return $snapshot;
    }
}
