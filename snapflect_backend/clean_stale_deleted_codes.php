<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$entities = [
    \App\Modules\Governance\Models\Organization::class => 'organization_code',
    \App\Modules\Governance\Models\BusinessUnit::class => 'business_unit_code',
    \App\Modules\Governance\Models\Department::class => 'department_code',
    \App\Modules\Governance\Models\Location::class => 'location_code',
    \App\Modules\Security\Models\Role::class => 'role_code',
    \App\Modules\Assessment\Models\AssessmentCategory::class => 'category_code',
    \App\Modules\Assessment\Models\AssessmentType::class => 'type_code',
    \App\Modules\Assessment\Models\AssessmentTemplate::class => 'template_code',
    \App\Modules\Assessment\Models\Assessment::class => 'assessment_code',
    \App\Modules\Assessment\Models\QuestionBank::class => 'bank_code',
    \App\Modules\Assessment\Models\Question::class => 'question_code',
    \App\Modules\Assessment\Models\CompetencyGroup::class => 'group_code',
    \App\Modules\Assessment\Models\Competency::class => 'competency_code',
];

echo "Starting cleanup of stale soft-deleted codes...\n\n";

foreach ($entities as $modelClass => $codeField) {
    if (!class_exists($modelClass)) {
        echo "Class not found: $modelClass\n";
        continue;
    }

    $model = new $modelClass();
    $deletedAtColumn = 'deleted_date';

    $records = $modelClass::withTrashed()
        ->whereNotNull($deletedAtColumn)
        ->where($codeField, 'NOT LIKE', '%::d_%')
        ->get();

    if ($records->isEmpty()) {
        echo "No stale records found for $modelClass\n";
        continue;
    }

    echo "Found " . $records->count() . " stale records for $modelClass\n";

    foreach ($records as $record) {
        $suffix = '::d_' . time();
        $maxCodeLength = 50; 
        if (method_exists($record, 'getCodeFieldMaxLength')) {
            $maxCodeLength = $record->getCodeFieldMaxLength();
        }
        
        $allowedOriginalLength = $maxCodeLength - strlen($suffix);
        $originalCode = substr($record->{$codeField}, 0, $allowedOriginalLength);
        
        $newCode = $originalCode . $suffix;
        echo "  - Updating {$record->{$codeField}} -> $newCode\n";
        
        $record->{$codeField} = $newCode;
        $record->saveQuietly();
    }
}

echo "\nCleanup complete!\n";
