<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\Question;
use App\Modules\Assessment\Models\Competency;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$assessment = Assessment::where('assessment_name', 'DOTNET Assessment')->first();
if (!$assessment) {
    echo "Assessment not found\n";
    exit;
}

$blueprint = $assessment->blueprint;
if (!$blueprint) {
    echo "No blueprint\n";
    exit;
}

$sections = $blueprint->sections;
if ($sections->count() > 0) {
    $weight = 100 / $sections->count();
    foreach ($sections as $section) {
        $section->section_weight = $weight;
        $section->save();
        echo "Updated section weight for '{$section->section_name}' to {$weight}\n";
        
        if ($section->section_name === 'Core Technical Knowledge') {
            if (DB::table('blueprint_section_questions')->where('blueprint_section_id', $section->id)->count() == 0) {
                $question = Question::first();
                if ($question) {
                    DB::table('blueprint_section_questions')->insert([
                        'uuid' => (string) Str::uuid(),
                        'blueprint_section_id' => $section->id,
                        'question_id' => $question->id,
                        'display_order' => 1,
                        'created_date' => now(),
                        'created_by' => 1
                    ]);
                    echo "Added question to 'Core Technical Knowledge'\n";
                }
            }
        }
    }
}

$questionsToFix = [
    'da4adacf-3977-4897-bd31-250c86db47bf',
    'a192d014-70e8-4f68-9c5c-84f48b5da5e0'
];

$competency = Competency::first();
if ($competency) {
    foreach ($questionsToFix as $uuid) {
        $q = Question::where('uuid', $uuid)->first();
        if ($q) {
            $exists = DB::table('question_competencies')
                ->where('question_id', $q->id)
                ->where('competency_id', $competency->id)
                ->exists();
                
            if (!$exists) {
                DB::table('question_competencies')->insert([
                    'uuid' => (string) Str::uuid(),
                    'question_id' => $q->id,
                    'competency_id' => $competency->id,
                    'weight_percentage' => 100,
                    'created_date' => now(),
                    'created_by' => 1
                ]);
                echo "Added competency mapping to question $uuid\n";
            }
        }
    }
} else {
    echo "No competency found to map.\n";
}
echo "Done.\n";
