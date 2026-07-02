<?php

use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Models\QuestionScore;
use App\Modules\Results\Models\ManualScoreReview;
use App\Modules\Assessment\Models\Question;
use Illuminate\Support\Str;
use Carbon\Carbon;

use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\AssessmentSnapshot;

// Check if we have an organization
$orgId = 1;

$version = AssessmentVersion::find(1);
if (!$version) {
    $version = new AssessmentVersion();
    $version->id = 1;
    $version->uuid = Str::uuid();
    $version->assessment_id = 1;
    $version->version_number = 1;
    $version->status = 'ACTIVE';
    $version->created_by = 1;
    $version->save();
}

$snapshot = AssessmentSnapshot::find(1);
if (!$snapshot) {
    $snapshot = new AssessmentSnapshot();
    $snapshot->id = 1;
    $snapshot->uuid = Str::uuid();
    $snapshot->assessment_version_id = 1;
    $snapshot->snapshot_hash = 'hash';
    $snapshot->snapshot_data = '{}';
    $snapshot->created_by = 1;
    $snapshot->save();
}

$candidate = User::where('email', 'john.doe@example.com')->first();
if (!$candidate) {
    $candidate = new User();
    $candidate->uuid = Str::uuid();
    $candidate->organization_id = $orgId;
    $candidate->email = 'john.doe@example.com';
    $candidate->first_name = 'John';
    $candidate->last_name = 'Doe';
    $candidate->password = bcrypt('password');
    $candidate->status = 'ACTIVE';
    $candidate->save();
}

$question = Question::find(1);
if (!$question) {
    $question = new Question();
    $question->id = 1;
    $question->uuid = Str::uuid();
    $question->organization_id = 1;
    $question->assessment_id = 1;
    $question->question_text = 'Dummy question?';
    $question->question_type = 'ESSAY';
    $question->status = 'ACTIVE';
    $question->created_by = 1;
    $question->save();
}

$session = AssessmentSession::find(1);
if (!$session) {
    $session = new AssessmentSession();
    $session->id = 1;
    $session->uuid = Str::uuid();
    $session->organization_id = 1;
    $session->assessment_id = 1;
    $session->assessment_version_id = 1;
    $session->candidate_user_id = $candidate->id;
    $session->session_token = Str::random(32);
    $session->session_status = 'ACTIVE';
    $session->created_by = 1;
    $session->save();
}

// Make sure we have at least one assessment
$assessment = Assessment::first();
if (!$assessment) {
    $assessment = new Assessment();
    $assessment->uuid = Str::uuid();
    $assessment->organization_id = $orgId;
    $assessment->title = "Software Engineering Pre-Screen";
    $assessment->status = 'PUBLISHED';
    $assessment->created_by = 1;
    $assessment->created_date = now();
    $assessment->save();
}



echo "Generating mock attempts...\n";
// Create 5 attempts
for ($i = 0; $i < 5; $i++) {
    $attempt = new AssessmentAttempt();
    $attempt->uuid = Str::uuid();
    $attempt->organization_id = $orgId;
    $attempt->assessment_id = $assessment->id;
    $attempt->candidate_user_id = $candidate->id;
    $attempt->assessment_session_id = $session->id;
    $attempt->assessment_version_id = $version->id;
    $attempt->assessment_snapshot_id = $snapshot->id;
    $attempt->status = $i === 0 ? 'IN_PROGRESS' : 'COMPLETED';
    $attempt->started_at = now()->subDays($i);
    $attempt->created_by = 1;
    $attempt->save();

    if ($i > 0) {
        $result = new AssessmentResult();
        $result->uuid = Str::uuid();
        $result->organization_id = $orgId;
        $result->assessment_id = $assessment->id;
        $result->assessment_attempt_id = $attempt->id;
        $result->candidate_user_id = $candidate->id;
        $result->assessment_version_id = $version->id;
        $result->assessment_snapshot_id = $snapshot->id;
        $result->result_reference = 'REF-' . Str::random(8);
        $result->result_version = 1;
        $result->result_status = 'PUBLISHED';
        $result->overall_percentage = rand(40, 95);
        $result->overall_score = $result->overall_percentage;
        $result->pass_fail_status = $result->overall_percentage >= 70 ? 'PASS' : 'FAIL';
        $result->calculated_at = now()->subDays($i);
        $result->created_by = 1;
        $result->save();
    }
}
echo "Done seeding analytics data.\n";
