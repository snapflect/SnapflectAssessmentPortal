<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results\Services;

use App\Modules\Results\DTOs\CompetencyScoreDto;
use App\Modules\Results\DTOs\QuestionScoreDto;
use App\Modules\Results\Services\EvaluationService;
use PHPUnit\Framework\TestCase;

class EvaluationServiceTest extends TestCase
{
    private EvaluationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EvaluationService();
    }

    public function test_passes_when_exceeding_score_threshold(): void
    {
        $blueprint = [
            'scoring_rules' => [
                'pass_threshold_percentage' => 70.0,
                'strict_competency_mode' => false
            ]
        ];

        $qScores = [
            new QuestionScoreDto('q-1', 50.0, 40.0, 0.0, true, 'EXACT', ''), // 80% overall
        ];

        $result = $this->service->evaluateAttempt($blueprint, $qScores, []);

        $this->assertSame(40.0, $result->rawScore);
        $this->assertSame(50.0, $result->maxScore);
        $this->assertSame(80.0, $result->percentage);
        $this->assertTrue($result->scorePassed);
        $this->assertTrue($result->competencyPassed);
        $this->assertTrue($result->overallPassed);
        $this->assertStringContainsString('achieved 80%', $result->passReason);
        $this->assertSame('', $result->failReason);
    }

    public function test_fails_when_below_score_threshold(): void
    {
        $blueprint = [
            'scoring_rules' => [
                'pass_threshold_percentage' => 70.0,
                'strict_competency_mode' => false
            ]
        ];

        $qScores = [
            new QuestionScoreDto('q-1', 50.0, 30.0, 0.0, true, 'EXACT', ''), // 60% overall
        ];

        $result = $this->service->evaluateAttempt($blueprint, $qScores, []);

        $this->assertSame(30.0, $result->rawScore);
        $this->assertSame(50.0, $result->maxScore);
        $this->assertSame(60.0, $result->percentage);
        $this->assertFalse($result->scorePassed);
        $this->assertTrue($result->competencyPassed);
        $this->assertFalse($result->overallPassed);
        $this->assertSame('', $result->passReason);
        $this->assertStringContainsString('missing the 70%', $result->failReason);
    }

    public function test_overall_pass_but_strict_competency_failure(): void
    {
        $blueprint = [
            'scoring_rules' => [
                'pass_threshold_percentage' => 70.0,
                'strict_competency_mode' => true
            ]
        ];

        $qScores = [
            new QuestionScoreDto('q-1', 100.0, 80.0, 0.0, true, 'EXACT', ''), // 80% overall
        ];

        $cScores = [
            new CompetencyScoreDto('comp-1', 'React', 50.0, 40.0, 80.0, 50.0, true, 1),
            new CompetencyScoreDto('comp-2', 'CSS', 50.0, 20.0, 40.0, 50.0, false, 1) // Failed CSS
        ];

        $result = $this->service->evaluateAttempt($blueprint, $qScores, $cScores);

        $this->assertTrue($result->scorePassed);
        $this->assertFalse($result->competencyPassed);
        $this->assertFalse($result->overallPassed);
        $this->assertStringContainsString('Failed required competencies: [CSS]', $result->failReason);
    }

    public function test_negative_scores_floored_to_zero(): void
    {
        $blueprint = [
            'scoring_rules' => [
                'pass_threshold_percentage' => 70.0
            ]
        ];

        $qScores = [
            new QuestionScoreDto('q-1', 10.0, -5.0, 5.0, false, 'EXACT', ''),
        ];

        $result = $this->service->evaluateAttempt($blueprint, $qScores, []);

        $this->assertSame(0.0, $result->rawScore);
        $this->assertSame(10.0, $result->maxScore);
        $this->assertSame(0.0, $result->percentage);
        $this->assertFalse($result->overallPassed);
    }
}
