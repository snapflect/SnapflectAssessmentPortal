<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Services across the execution pipeline
use App\Modules\Delivery\Services\AssessmentValidationService;
use App\Modules\Delivery\Services\AssessmentPublicationService;
use App\Modules\Delivery\Services\SessionLaunchService;
use App\Modules\Delivery\Services\AutoSaveService;
use App\Modules\Delivery\Services\ResumeEngineService;
use App\Modules\Delivery\Services\SubmissionEngineService;
use App\Modules\Delivery\DTOs\SessionLaunchDto;
use App\Modules\Delivery\DTOs\AutoSaveDto;
use App\Modules\Delivery\DTOs\ResumeDto;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use App\Modules\Delivery\Exceptions\SessionLaunchException;
use App\Modules\Delivery\Exceptions\AutoSaveException;
use App\Modules\Delivery\Exceptions\ResumeException;
use App\Modules\Delivery\Exceptions\SubmissionException;

// Models
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;

class AssessmentExecutionIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private $validationService;
    private $publicationService;
    private $launchService;
    private $autoSaveService;
    private $resumeService;
    private $submissionService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->validationService = $this->app->make(AssessmentValidationService::class);
        $this->publicationService = $this->app->make(AssessmentPublicationService::class);
        $this->launchService = $this->app->make(SessionLaunchService::class);
        $this->autoSaveService = $this->app->make(AutoSaveService::class);
        $this->resumeService = $this->app->make(ResumeEngineService::class);
        $this->submissionService = $this->app->make(SubmissionEngineService::class);

        \Illuminate\Support\Facades\Config::set('assessment.grace_period_seconds', 0);
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    }

    protected function tearDown(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        parent::tearDown();
    }

    private function createValidPublishedAssessment(): AssessmentVersion
    {
        $assessment = new Assessment();
        $assessment->id = 1;
        $assessment->uuid = Str::uuid()->toString();
        $assessment->organization_id = 1;
        $assessment->title = 'Integration Test Assessment';
        $assessment->status = 'PUBLISHED';
        $assessment->save();

        $version = new AssessmentVersion();
        $version->id = 1;
        $version->organization_id = 1;
        $version->assessment_id = 1;
        $version->version_number = 1;
        $version->status = 'PUBLISHED';
        $version->is_active = true;
        $version->blueprint_json = json_encode([
            'blueprint' => [
                'time_limit_minutes' => 60,
                'sections' => [
                    [
                        'uuid' => 'sec-1',
                        'questions' => [
                            ['uuid' => 'q-1', 'question_type' => 'single_choice', 'options' => [['uuid' => 'opt-1']]],
                            ['uuid' => 'q-2', 'question_type' => 'multiple_choice', 'options' => [['uuid' => 'opt-2']]]
                        ]
                    ]
                ]
            ]
        ]);
        $version->blueprint_hash = 'fakehash';
        $version->published_at = Carbon::now();
        $version->save();

        return $version;
    }

    private function createDraftAssessment(): AssessmentVersion
    {
        $assessment = new Assessment();
        $assessment->id = 2;
        $assessment->uuid = Str::uuid()->toString();
        $assessment->organization_id = 1;
        $assessment->title = 'Draft Assessment';
        $assessment->status = 'DRAFT';
        $assessment->save();

        $version = new AssessmentVersion();
        $version->id = 2;
        $version->organization_id = 1;
        $version->assessment_id = 2;
        $version->version_number = 1;
        $version->status = 'DRAFT';
        $version->is_active = false;
        $version->blueprint_json = json_encode([]);
        $version->blueprint_hash = 'fakehash';
        $version->save();

        return $version;
    }

    public function test_flow_001_full_successful_execution_pipeline()
    {
        // 1. Validation & Publication (Simulated via helper)
        $version = $this->createValidPublishedAssessment();

        // 2. Session Launch (Includes Randomization Generation)
        $launchDto = new SessionLaunchDto($version->assessment->uuid);
        $launchResult = $this->launchService->launchSession($launchDto, 1, 1);
        
        $this->assertNotNull($launchResult->attemptUuid);
        $this->assertEquals(2, $launchResult->totalQuestions);
        $this->assertNotNull($launchResult->randomizationSeed);
        
        // Retrieve attempt
        $attempt = AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->first();
        $this->assertEquals('CREATED', $attempt->status);

        // 3. Auto Save (Timer active)
        $qUuid = $launchResult->questionOrder[0]; // Get first randomized question
        $saveDto = new AutoSaveDto($attempt->uuid, $qUuid, 'opt-xyz', '1');
        $saveResult = $this->autoSaveService->executeSave($saveDto, 1, 1);
        
        $this->assertTrue($saveResult->success);

        // 4. Resume (Restore Drafts and state)
        $resumeDto = new ResumeDto($attempt->uuid);
        $resumeResult = $this->resumeService->resumeAttempt($resumeDto, 1, 1);
        
        $this->assertEquals(1, $resumeResult->answeredQuestions);
        $this->assertEquals(50.0, $resumeResult->completionPercentage);
        $this->assertArrayHasKey($qUuid, $resumeResult->draftAnswers);

        // 5. Submit
        $submitDto = new SubmitAttemptDto($attempt->uuid);
        $submitResult = $this->submissionService->submitAttempt($submitDto, 1, 1);
        
        $this->assertEquals('SUBMITTED', $submitResult->finalStatus);
        $this->assertEquals(1, $submitResult->answeredQuestions);
        
        $finalAttempt = AssessmentAttempt::find($attempt->id);
        $this->assertEquals('SUBMITTED', $finalAttempt->status);
    }

    public function test_flow_002_draft_assessment_blocks_launch()
    {
        $version = $this->createDraftAssessment();
        $launchDto = new SessionLaunchDto($version->assessment->uuid);

        $this->expectException(SessionLaunchException::class);
        $this->expectExceptionMessage('Assessment is not published.');
        
        $this->launchService->launchSession($launchDto, 1, 1);
    }

    public function test_flow_003_randomization_integrity_restored_on_resume()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $resumeResult = $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), 1, 1);
        
        $this->assertEquals($launchResult->randomizationSeed, $resumeResult->randomizationSeed);
        $this->assertEquals($launchResult->questionOrder, $resumeResult->questionOrder);
        $this->assertEquals($launchResult->optionOrder, $resumeResult->optionOrder);
    }

    public function test_flow_004_auto_save_restored_on_resume()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $qUuid = $launchResult->questionOrder[0];
        $this->autoSaveService->executeSave(new AutoSaveDto($launchResult->attemptUuid, $qUuid, 'A', '1'), 1, 1);
        $this->autoSaveService->executeSave(new AutoSaveDto($launchResult->attemptUuid, $qUuid, 'B', '2'), 1, 1); // Latest save wins
        
        $resumeResult = $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), 1, 1);
        
        $this->assertEquals('B', $resumeResult->draftAnswers[$qUuid]['payload']);
        $this->assertEquals(2, $resumeResult->draftAnswers[$qUuid]['version']);
    }

    public function test_flow_005_expired_attempt_denies_resume()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $attempt = AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->first();
        $attempt->expires_at = Carbon::now()->subMinutes(1);
        $attempt->save();

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('The attempt has expired and cannot be resumed.');

        $this->resumeService->resumeAttempt(new ResumeDto($attempt->uuid), 1, 1);
    }

    public function test_flow_006_expired_attempt_auto_finalizes_on_submit()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $attempt = AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->first();
        $attempt->expires_at = Carbon::now('UTC')->subMinutes(5);
        $attempt->save();

        $submitResult = $this->submissionService->submitAttempt(new SubmitAttemptDto($attempt->uuid), 1, 1);
        
        $this->assertEquals('SUBMITTED', $submitResult->finalStatus);
        
        $this->assertDatabaseHas('attempt_submissions', [
            'assessment_attempt_id' => $attempt->id,
            'submission_type' => 'AUTO_FINALIZED',
        ]);
    }

    public function test_flow_007_submit_blocks_resume()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), 1, 1);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Cannot resume attempt in state: SUBMITTED.');

        $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), 1, 1);
    }

    public function test_flow_008_submit_blocks_auto_save()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), 1, 1);

        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('Cannot save. Attempt is already submitted.');

        $this->autoSaveService->executeSave(new AutoSaveDto($launchResult->attemptUuid, 'q-1', 'A', '1'), 1, 1);
    }

    public function test_flow_009_duplicate_submit_is_idempotent()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $submit1 = $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), 1, 1);
        $submit2 = $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), 1, 1);

        $this->assertEquals($submit1->submittedAt, $submit2->submittedAt);
        
        $submissionsCount = DB::table('attempt_submissions')
            ->where('assessment_attempt_id', AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->value('id'))
            ->count();
            
        $this->assertEquals(1, $submissionsCount); // No duplicate rows created
    }

    public function test_flow_010_cross_tenant_access_denied()
    {
        $version = $this->createValidPublishedAssessment();
        $launchResult = $this->launchService->launchSession(new SessionLaunchDto($version->assessment->uuid), 1, 1);
        
        $this->expectException(ResumeException::class);
        $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), 2, 1); // Org ID 2 mismatch
    }
}
