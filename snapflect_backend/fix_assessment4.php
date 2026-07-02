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
$blueprint = $assessment->blueprint;
$sections = $blueprint->sections;
$demoSection = $sections->where('section_name', 'DEMO_01')->first();

if ($demoSection) {
    $bank = \App\Modules\Assessment\Models\QuestionBank::first();
    // Create a brand new dummy question
    $newQ = Question::create([
        'uuid' => (string) Str::uuid(),
        'question_text' => 'Dummy Question for DEMO_01',
        'question_type' => 'MULTIPLE_CHOICE',
        'difficulty_level' => 'MEDIUM',
        'score' => 10,
        'created_by' => 1,
        'organization_id' => 1, // Assume 1 for testing
        'current_state' => 'APPROVED',
        'question_bank_id' => $bank ? $bank->id : 1,
        'question_code' => 'DUMMY-' . rand(1000, 9999)
    ]);
    
    // Add option for the question (auto-scored questions need a correct option)
    DB::table('question_options')->insert([
        'uuid' => (string) Str::uuid(),
        'question_id' => $newQ->id,
        'option_text' => 'Correct Answer',
        'is_correct' => 1,
        'display_order' => 1,
        'created_date' => now(),
        'created_by' => 1
    ]);
    
    // Add it to the section
    DB::table('blueprint_section_questions')->insert([
        'uuid' => (string) Str::uuid(),
        'blueprint_section_id' => $demoSection->id,
        'question_id' => $newQ->id,
        'display_order' => 1,
        'created_date' => now(),
        'created_by' => 1
    ]);
    
    // Give it a competency
    $competency = Competency::first();
    DB::table('question_competencies')->updateOrInsert(
        ['question_id' => $newQ->id, 'competency_id' => $competency->id],
        ['uuid' => (string) Str::uuid(), 'weight_percentage' => 100, 'created_date' => now(), 'created_by' => 1]
    );
    
    echo "Created dummy question and mapped to DEMO_01.\n";
} else {
    echo "DEMO_01 section not found.\n";
}
