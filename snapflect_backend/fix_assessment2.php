<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$assessment = Assessment::where('assessment_name', 'DOTNET Assessment')->first();
$blueprint = $assessment->blueprint;
$sections = $blueprint->sections;

// Fix weight
$count = $sections->count();
if ($count > 0) {
    // Make sure they sum to EXACTLY 100
    // E.g., if 3 sections: 34, 33, 33
    $baseWeight = floor(100 / $count);
    $remainder = 100 - ($baseWeight * $count);
    
    foreach ($sections as $index => $section) {
        $weight = $baseWeight + ($index < $remainder ? 1 : 0);
        $section->section_weight = $weight;
        $section->save();
        echo "Set weight for {$section->section_name} to $weight\n";
    }
}

// Fix duplicates
$existingQuestionIds = DB::table('blueprint_section_questions')
    ->whereIn('blueprint_section_id', $sections->pluck('id'))
    ->pluck('question_id')
    ->toArray();

// Check if any section has duplicate questions, or if we need to replace the duplicate we added
$duplicates = array_diff_assoc($existingQuestionIds, array_unique($existingQuestionIds));
if (!empty($duplicates)) {
    // Find the duplicate question ID
    $dupId = reset($duplicates);
    
    // Find the record we inserted into 'Core Technical Knowledge'
    $coreSection = $sections->where('section_name', 'Core Technical Knowledge')->first();
    if ($coreSection) {
        // Find a question that is NOT currently in the blueprint
        $newQuestion = Question::whereNotIn('id', array_unique($existingQuestionIds))->first();
        if ($newQuestion) {
            DB::table('blueprint_section_questions')
                ->where('blueprint_section_id', $coreSection->id)
                ->where('question_id', $dupId)
                ->update(['question_id' => $newQuestion->id]);
            echo "Replaced duplicate question with a fresh one\n";
            
            // Give it a competency
            $competency = App\Modules\Assessment\Models\Competency::first();
            DB::table('question_competencies')->updateOrInsert(
                ['question_id' => $newQuestion->id, 'competency_id' => $competency->id],
                ['uuid' => (string) Str::uuid(), 'weight_percentage' => 100, 'created_date' => now(), 'created_by' => 1]
            );
        }
    }
}

echo "Data correction complete.\n";
