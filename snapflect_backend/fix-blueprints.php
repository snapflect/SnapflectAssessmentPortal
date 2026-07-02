<?php

use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentBlueprint;
use Illuminate\Support\Str;

$assessments = Assessment::all();
foreach ($assessments as $assessment) {
    if (!$assessment->blueprint) {
        AssessmentBlueprint::create([
            'uuid' => (string) Str::uuid(),
            'organization_id' => $assessment->organization_id,
            'assessment_id' => $assessment->id,
            'blueprint_name' => $assessment->assessment_name . ' Blueprint',
            'description' => 'Auto-generated blueprint for ' . $assessment->assessment_name,
            'status' => 'ACTIVE',
            'created_by' => $assessment->created_by,
        ]);
        echo "Created blueprint for {$assessment->assessment_name}\n";
    }
}
echo "Done.\n";
