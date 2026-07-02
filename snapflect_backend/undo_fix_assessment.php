<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Assessment\Models\Assessment;
use Illuminate\Support\Facades\DB;

$assessment = Assessment::where('assessment_name', 'DOTNET Assessment')->first();
if (!$assessment) {
    echo "Assessment not found\n";
    exit;
}

$blueprint = $assessment->blueprint;
if ($blueprint) {
    $sections = $blueprint->sections;
    foreach ($sections as $section) {
        $section->section_weight = 0; // Set to whatever it was before (probably 0 or invalid)
        $section->save();
        echo "Reverted weight for '{$section->section_name}'\n";
        
        if ($section->section_name === 'Core Technical Knowledge') {
            DB::table('blueprint_section_questions')->where('blueprint_section_id', $section->id)->delete();
            echo "Removed question from 'Core Technical Knowledge'\n";
        }
    }
}

$questionsToFix = [
    'da4adacf-3977-4897-bd31-250c86db47bf',
    'a192d014-70e8-4f68-9c5c-84f48b5da5e0'
];

foreach ($questionsToFix as $uuid) {
    $q = DB::table('questions')->where('uuid', $uuid)->first();
    if ($q) {
        DB::table('question_competencies')->where('question_id', $q->id)->delete();
        echo "Removed competency mapping from question $uuid\n";
    }
}
echo "Done.\n";
