<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Delivery;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Services across the execution pipeline
use App\Modules\Assessment\Services\AssessmentValidationService;
use App\Modules\Assessment\Services\AssessmentPublicationService;
use App\Modules\Delivery\Services\SessionLaunchService;
use App\Modules\Delivery\Services\AutoSaveService;
use App\Modules\Delivery\Services\ResumeEngineService;
use App\Modules\Delivery\Services\SubmissionEngineService;
use App\Modules\Delivery\DTOs\LaunchSessionDto;
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
    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Queue::fake();
        
        $this->validationService = $this->app->make(AssessmentValidationService::class);
        $this->publicationService = $this->app->make(AssessmentPublicationService::class);
        
        $mockSnapshotService = \Mockery::mock(\App\Modules\Assessment\Services\SnapshotGenerationService::class);
        $mockSnapshotService->shouldReceive('generate')->andReturnUsing(function($assessment, $userId) {
            $snapshot = new \App\Modules\Assessment\Models\AssessmentSnapshot();
            $snapshot->uuid = \Illuminate\Support\Str::uuid()->toString();
            $snapshot->organization_id = $assessment->organization_id;
            $snapshot->assessment_id = $assessment->id;
            $snapshot->assessment_version_id = $assessment->versions()->latest()->first()->id ?? 1;
            $snapshot->snapshot_schema_version = '1.0';
            $snapshot->snapshot_hash = 'fakehash';
            $snapshot->snapshot_json = json_encode([
                'blueprint' => [
                    'time_limit_minutes' => 60,
                    'sections' => [
                        [
                            'uuid'      => 'sec-1',
                            'questions' => [
                                ['uuid' => 'q-1', 'question_type' => 'single_choice',  'options' => [['uuid' => 'opt-1']]],
                                ['uuid' => 'q-2', 'question_type' => 'multiple_choice', 'options' => [['uuid' => 'opt-2']]]
                            ]
                        ]
                    ]
                ]
            ]);
            $snapshot->save();
            return $snapshot;
        });
        $this->app->instance(\App\Modules\Assessment\Services\SnapshotGenerationService::class, $mockSnapshotService);

        $this->launchService = $this->app->make(SessionLaunchService::class);
        $this->autoSaveService = $this->app->make(AutoSaveService::class);
        $this->resumeService = $this->app->make(ResumeEngineService::class);
        $this->submissionService = $this->app->make(SubmissionEngineService::class);

        \Illuminate\Support\Facades\Config::set('assessment.grace_period_seconds', 0);
        DB::statement('PRAGMA foreign_keys = OFF;');
        $this->user = \App\Modules\Security\Models\User::factory()->create();
    }

    protected function tearDown(): void
    {
        DB::statement('PRAGMA foreign_keys = ON;');
        \Mockery::close();
        parent::tearDown();
    }

    private function createValidPublishedAssessment(): Assessment
    {
        $assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'assessment_name' => 'Integration Test Assessment',
            'current_state'   => 'PUBLISHED',
            'is_published'    => true,
            'created_by'      => $this->user->id,
        ]);

        $version = new AssessmentVersion();
        $version->organization_id = $this->user->organization_id;
        $version->assessment_id   = $assessment->id;
        $version->major_version   = 1;
        $version->minor_version   = 0;
        $version->version_label   = '1.0';
        $version->status          = 'PUBLISHED';
        $version->change_summary  = 'Initial version';
        $version->published_date  = Carbon::now();
        $version->created_by      = $this->user->id;
        $version->save();

        return $assessment;
    }

    private function createDraftAssessment(): Assessment
    {
        $assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'assessment_name' => 'Draft Assessment',
            'current_state'   => 'DRAFT',
            'is_published'    => false,
            'created_by'      => $this->user->id,
        ]);

        $version = new AssessmentVersion();
        $version->organization_id = $this->user->organization_id;
        $version->assessment_id   = $assessment->id;
        $version->major_version   = 1;
        $version->minor_version   = 0;
        $version->version_label   = '1.0';
        $version->status          = 'DRAFT';
        $version->change_summary  = 'Initial draft';
        $version->created_by      = $this->user->id;
        $version->save();

        return $assessment;
    }
    
    private function launchAssessmentSession(Assessment $assessment): \App\Modules\Delivery\DTOs\RandomizationResultDto
    {
        $sessionDto = $this->launchService->createSession($assessment->uuid, $this->user->id, $this->user->organization_id, $this->user->id);
        return $this->launchService->launchSession($sessionDto->sessionUuid, $this->user->organization_id, $this->user->id);
    }

    public function test_flow_001_full_successful_execution_pipeline()
    {
        $assessment = $this->createValidPublishedAssessment();

        $launchResult = $this->launchAssessmentSession($assessment);
        
        $this->assertNotNull($launchResult->attemptUuid);
        $this->assertNotNull($launchResult->seed);
        
        $attempt = AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->first();
        $this->assertEquals('IN_PROGRESS', $attempt->status);

        $qUuid = 'q-1';
        $saveDto = new AutoSaveDto($attempt->uuid, $qUuid, 'opt-xyz', '1');
        $saveResult = $this->autoSaveService->executeSave($saveDto, $this->user->organization_id, $this->user->id);
        
        $this->assertTrue($saveResult->success);

        $resumeDto = new ResumeDto($attempt->uuid);
        $resumeResult = $this->resumeService->resumeAttempt($resumeDto, $this->user->organization_id, $this->user->id);
        
        $this->assertEquals(50.0, $resumeResult->completionPercentage);
        $this->assertArrayHasKey($qUuid, $resumeResult->draftAnswers);

        $submitDto = new SubmitAttemptDto($attempt->uuid);
        $submitResult = $this->submissionService->submitAttempt($submitDto, $this->user->organization_id, $this->user->id);
        
        $this->assertEquals('SUBMITTED', $submitResult->finalStatus);
        $this->assertEquals(1, $submitResult->answeredQuestions);
        
        $finalAttempt = AssessmentAttempt::find($attempt->id);
        $this->assertEquals('SUBMITTED', $finalAttempt->status);
    }

    public function test_flow_002_draft_assessment_blocks_launch()
    {
        $assessment = $this->createDraftAssessment();

        $this->expectException(SessionLaunchException::class);
        $this->expectExceptionMessage('Cannot create session for non-published assessment.');
        
        $this->launchService->createSession($assessment->uuid, $this->user->id, $this->user->organization_id, $this->user->id);
    }

    public function test_flow_003_randomization_integrity_restored_on_resume()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $resumeResult = $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);
        
        $this->assertEquals($launchResult->seed, $resumeResult->randomizationSeed);
        $this->assertNotEmpty($resumeResult->questionOrder);
        $this->assertNotEmpty($resumeResult->optionOrder);
    }

    public function test_flow_004_auto_save_restored_on_resume()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $qUuid = 'q-1';
        $this->autoSaveService->executeSave(new AutoSaveDto($launchResult->attemptUuid, $qUuid, 'A', '1'), $this->user->organization_id, $this->user->id);
        $this->autoSaveService->executeSave(new AutoSaveDto($launchResult->attemptUuid, $qUuid, 'B', '2'), $this->user->organization_id, $this->user->id); // Latest save wins
        
        $resumeResult = $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);
        
        $this->assertEquals('B', $resumeResult->draftAnswers[$qUuid]['payload']);
        $this->assertEquals(2, $resumeResult->draftAnswers[$qUuid]['version']);
    }

    public function test_flow_005_expired_attempt_denies_resume()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $attempt = AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->first();
        $attempt->expires_at = Carbon::now()->subMinutes(1);
        $attempt->save();

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('The attempt has expired and cannot be resumed.');

        $this->resumeService->resumeAttempt(new ResumeDto($attempt->uuid), $this->user->organization_id, $this->user->id);
    }

    public function test_flow_006_expired_attempt_auto_finalizes_on_submit()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $attempt = AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->first();
        $attempt->expires_at = Carbon::now('UTC')->subMinutes(5);
        $attempt->save();

        $submitResult = $this->submissionService->submitAttempt(new SubmitAttemptDto($attempt->uuid), $this->user->organization_id, $this->user->id);
        
        $this->assertEquals('SUBMITTED', $submitResult->finalStatus);
        
        $this->assertDatabaseHas('attempt_submissions', [
            'assessment_attempt_id' => $attempt->id,
            'submission_type' => 'AUTO_FINALIZED',
        ]);
    }

    public function test_flow_007_submit_blocks_resume()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);

        $this->expectException(ResumeException::class);
        $this->expectExceptionMessage('Cannot resume attempt in state: SUBMITTED.');

        $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);
    }

    public function test_flow_008_submit_blocks_auto_save()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);

        $this->expectException(AutoSaveException::class);
        $this->expectExceptionMessage('Cannot save. Attempt is already submitted.');

        $this->autoSaveService->executeSave(new AutoSaveDto($launchResult->attemptUuid, 'q-1', 'A', '1'), $this->user->organization_id, $this->user->id);
    }

    public function test_flow_009_duplicate_submit_is_idempotent()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $submit1 = $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);
        $submit2 = $this->submissionService->submitAttempt(new SubmitAttemptDto($launchResult->attemptUuid), $this->user->organization_id, $this->user->id);

        $this->assertEquals($submit1->submittedAt, $submit2->submittedAt);
        
        $submissionsCount = DB::table('attempt_submissions')
            ->where('assessment_attempt_id', AssessmentAttempt::where('uuid', $launchResult->attemptUuid)->value('id'))
            ->count();
            
        $this->assertEquals(1, $submissionsCount);
    }

    public function test_flow_010_cross_tenant_access_denied()
    {
        $assessment = $this->createValidPublishedAssessment();
        $launchResult = $this->launchAssessmentSession($assessment);
        
        $this->expectException(ResumeException::class);
        $this->resumeService->resumeAttempt(new ResumeDto($launchResult->attemptUuid), 2, 1);
    }
}
