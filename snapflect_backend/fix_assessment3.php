<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Assessment\Models\Assessment;
use Illuminate\Support\Facades\DB;

$assessment = Assessment::where('assessment_name', 'DOTNET Assessment')->first();
$blueprint = $assessment->blueprint;
$sections = $blueprint->sections;

$existingQuestionIds = DB::table('blueprint_section_questions')
    ->whereIn('blueprint_section_id', $sections->pluck('id'))
    ->pluck('question_id')
    ->toArray();

echo "Existing question IDs mapped to this blueprint: " . implode(", ", $existingQuestionIds) . "\n";

$duplicates = array_unique(array_diff_assoc($existingQuestionIds, array_unique($existingQuestionIds)));

if (!empty($duplicates)) {
    echo "Found duplicates: " . implode(", ", $duplicates) . "\n";
    foreach ($duplicates as $dupId) {
        // Keep the first mapping, delete all others for this question in this blueprint
        $mappings = DB::table('blueprint_section_questions')
            ->whereIn('blueprint_section_id', $sections->pluck('id'))
            ->where('question_id', $dupId)
            ->get();
            
        // Shift the first one off (we keep it)
        $mappings->shift();
        
        // Delete the rest
        foreach ($mappings as $mapping) {
            DB::table('blueprint_section_questions')->where('id', $mapping->id)->delete();
            echo "Deleted duplicate mapping ID {$mapping->id} for question ID {$dupId}\n";
        }
    }
} else {
    echo "No duplicates found.\n";
}

echo "Final check of question counts per section:\n";
foreach ($sections as $section) {
    $count = DB::table('blueprint_section_questions')->where('blueprint_section_id', $section->id)->count();
    echo "Section '{$section->section_name}' has $count questions.\n";
    
    // Ensure at least one question per section (if we deleted the only one, we must add one back)
    if ($count == 0) {
        echo "Section '{$section->section_name}' is now empty! Adding a fresh question...\n";
        
        $currentMapped = DB::table('blueprint_section_questions')
            ->whereIn('blueprint_section_id', $sections->pluck('id'))
            ->pluck('question_id')
            ->toArray();
            
        $newQ = \App\Modules\Assessment\Models\Question::whereNotIn('id', $currentMapped)->first();
        if ($newQ) {
            DB::table('blueprint_section_questions')->insert([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'blueprint_section_id' => $section->id,
                'question_id' => $newQ->id,
                'display_order' => 1,
                'created_date' => now(),
                'created_by' => 1
            ]);
            echo "Added new question ID {$newQ->id} to '{$section->section_name}'\n";
            
            // Give it a competency
            $competency = \App\Modules\Assessment\Models\Competency::first();
            DB::table('question_competencies')->updateOrInsert(
                ['question_id' => $newQ->id, 'competency_id' => $competency->id],
                ['uuid' => (string) \Illuminate\Support\Str::uuid(), 'weight_percentage' => 100, 'created_date' => now(), 'created_by' => 1]
            );
        } else {
            echo "Failed to find an unused question!\n";
        }
    }
}

echo "Done.\n";
