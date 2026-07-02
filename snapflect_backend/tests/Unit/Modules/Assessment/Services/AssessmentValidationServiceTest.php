<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use App\Modules\Assessment\Services\AssessmentValidationService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentBlueprint;
use App\Modules\Assessment\Models\BlueprintSection;
use App\Modules\Assessment\Models\BlueprintSectionQuestion;
use App\Modules\Assessment\Models\Question;
use Illuminate\Database\Eloquent\Builder;
use Mockery;
use Illuminate\Support\Collection;

class AssessmentValidationServiceTest extends TestCase
{
    private AssessmentValidationService $service;
    private $repositoryMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositoryMock = Mockery::mock(AssessmentRepositoryInterface::class);
        $this->service = new AssessmentValidationService($this->repositoryMock);
    }

    private function setupRepositoryMock(Assessment $assessment = null)
    {
        $builderMock = Mockery::mock(Builder::class);
        $builderMock->shouldReceive('where')->andReturnSelf();
        $builderMock->shouldReceive('with')->andReturnSelf();
        $builderMock->shouldReceive('first')->andReturn($assessment);
        
        $this->repositoryMock->shouldReceive('query')->andReturn($builderMock);
    }

    public function test_fails_on_tenant_mismatch()
    {
        $this->setupRepositoryMock(null); // Assessment not found for this tenant

        $result = $this->service->validate('some-uuid', 999, 1);

        $this->assertFalse($result->isValid);
        $this->assertFalse($result->readyForPublication);
        $this->assertCount(1, $result->validationErrors);
        $this->assertEquals('RULE-AV-000', $result->validationErrors[0]->rule);
    }

    public function test_passes_all_rules_when_valid()
    {
        $assessment = new Assessment([
            'uuid' => 'assessment-1',
            'assessment_name' => 'Valid Title',
            'estimated_duration_minutes' => 60
        ]);

        $question = new Question([
            'uuid' => 'q-1',
            'question_type' => 'MULTIPLE_CHOICE'
        ]);
        $question->correct_options_count = 1;
        $question->competencies_count = 1;

        $sectionQuestion = new BlueprintSectionQuestion();
        $sectionQuestion->setRelation('question', $question);

        $section = new BlueprintSection(['section_name' => 'Sec1', 'section_weight' => 100.0]);
        $section->setRelation('sectionQuestions', collect([$sectionQuestion]));

        $blueprint = new AssessmentBlueprint();
        $blueprint->setRelation('sections', collect([$section]));

        $assessment->setRelation('blueprint', $blueprint);

        $this->setupRepositoryMock($assessment);

        $result = $this->service->validate('assessment-1', 1, 1);

        $this->assertTrue($result->isValid);
        $this->assertTrue($result->readyForPublication);
        $this->assertCount(0, $result->validationErrors);
    }

    public function test_collects_multiple_errors_without_stopping()
    {
        $assessment = new Assessment([
            'uuid' => 'assessment-1',
            'assessment_name' => '', // Fails AV-001
            'estimated_duration_minutes' => 0 // Fails AV-002
        ]);

        $question = new Question([
            'uuid' => 'q-1',
            'question_type' => 'MULTIPLE_CHOICE'
        ]);
        $question->correct_options_count = 0; // Fails AV-004
        $question->competencies_count = 0; // Fails AV-005

        $sectionQuestion1 = new BlueprintSectionQuestion();
        $sectionQuestion1->setRelation('question', $question);

        $sectionQuestion2 = new BlueprintSectionQuestion();
        $sectionQuestion2->setRelation('question', $question); // Duplicate question fails AV-008

        $section1 = new BlueprintSection(['section_name' => 'Sec1', 'section_weight' => 50.0]); // Total is 50, fails AV-006
        $section1->setRelation('sectionQuestions', collect([$sectionQuestion1, $sectionQuestion2]));

        $section2 = new BlueprintSection(['section_name' => 'EmptySec', 'section_weight' => 0]);
        $section2->setRelation('sectionQuestions', collect([])); // Fails AV-007

        $blueprint = new AssessmentBlueprint();
        $blueprint->setRelation('sections', collect([$section1, $section2]));

        $assessment->setRelation('blueprint', $blueprint);

        $this->setupRepositoryMock($assessment);

        $result = $this->service->validate('assessment-1', 1, 1);

        $this->assertFalse($result->isValid);
        $this->assertFalse($result->readyForPublication);
        
        $errorRules = array_map(fn($e) => $e->rule, $result->validationErrors);
        
        $this->assertContains('RULE-AV-001', $errorRules);
        $this->assertContains('RULE-AV-002', $errorRules);
        $this->assertContains('RULE-AV-004', $errorRules);
        $this->assertContains('RULE-AV-005', $errorRules);
        $this->assertContains('RULE-AV-006', $errorRules);
        $this->assertContains('RULE-AV-007', $errorRules);
        $this->assertContains('RULE-AV-008', $errorRules);
    }
    
    public function test_ignores_correct_answer_rule_for_manual_scored_questions()
    {
        $assessment = new Assessment([
            'uuid' => 'assessment-1',
            'assessment_name' => 'Valid Title',
            'estimated_duration_minutes' => 60
        ]);

        // Manual scored question
        $question = new Question([
            'uuid' => 'q-1',
            'question_type' => 'ESSAY'
        ]);
        // Missing correct option, but should not fail because it's manual scored!
        $question->correct_options_count = 0; 
        $question->competencies_count = 1;

        $sectionQuestion = new BlueprintSectionQuestion();
        $sectionQuestion->setRelation('question', $question);

        $section = new BlueprintSection(['section_name' => 'Sec1', 'section_weight' => 100.0]);
        $section->setRelation('sectionQuestions', collect([$sectionQuestion]));

        $blueprint = new AssessmentBlueprint();
        $blueprint->setRelation('sections', collect([$section]));
        $assessment->setRelation('blueprint', $blueprint);

        $this->setupRepositoryMock($assessment);

        $result = $this->service->validate('assessment-1', 1, 1);

        $this->assertTrue($result->isValid);
        // AV-004 should NOT be in the errors
        $errorRules = array_map(fn($e) => $e->rule, $result->validationErrors);
        $this->assertNotContains('RULE-AV-004', $errorRules);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
