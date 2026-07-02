<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results\Services;

use App\Modules\Results\DTOs\QuestionScoreDto;
use App\Modules\Results\Services\CompetencyScoringService;
use PHPUnit\Framework\TestCase;

class CompetencyScoringServiceTest extends TestCase
{
    private CompetencyScoringService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CompetencyScoringService();
    }

    public function test_evaluates_competencies_correctly(): void
    {
        $blueprint = [
            'competencies' => [
                [
                    'uuid' => 'comp-1',
                    'name' => 'React',
                    'weight' => 40.0,
                    'pass_threshold_percentage' => 70.0
                ],
                [
                    'uuid' => 'comp-2',
                    'name' => 'CSS',
                    'weight' => 20.0,
                    'pass_threshold_percentage' => 50.0
                ]
            ],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'competency_uuids' => ['comp-1'] // React
                        ],
                        [
                            'uuid' => 'q-2',
                            'competency_uuids' => ['comp-1', 'comp-2'] // Both
                        ]
                    ]
                ]
            ]
        ];

        $scores = [
            // q-1: 5 / 10
            new QuestionScoreDto('q-1', 10.0, 5.0, 0.0, false, 'EXACT_MATCH', ''),
            // q-2: 10 / 10
            new QuestionScoreDto('q-2', 10.0, 10.0, 0.0, true, 'EXACT_MATCH', '')
        ];

        $results = $this->service->evaluateCompetencies($blueprint, $scores);

        $this->assertCount(2, $results);

        // Assert React (comp-1)
        // Max = 20, Awarded = 15, Percentage = 75%
        $react = $results[0]->competencyUuid === 'comp-1' ? $results[0] : $results[1];
        $this->assertSame('React', $react->competencyName);
        $this->assertSame(20.0, $react->maxScore);
        $this->assertSame(15.0, $react->awardedScore);
        $this->assertSame(75.0, $react->percentage);
        $this->assertTrue($react->passed); // 75 >= 70
        $this->assertSame(2, $react->questionCount);
        $this->assertSame(40.0, $react->weight);

        // Assert CSS (comp-2)
        // Max = 10, Awarded = 10, Percentage = 100%
        $css = $results[0]->competencyUuid === 'comp-2' ? $results[0] : $results[1];
        $this->assertSame('CSS', $css->competencyName);
        $this->assertSame(10.0, $css->maxScore);
        $this->assertSame(10.0, $css->awardedScore);
        $this->assertSame(100.0, $css->percentage);
        $this->assertTrue($css->passed); // 100 >= 50
        $this->assertSame(1, $css->questionCount);
        $this->assertSame(20.0, $css->weight);
    }

    public function test_floors_negative_competency_scores_to_zero(): void
    {
        $blueprint = [
            'competencies' => [
                [
                    'uuid' => 'comp-1',
                    'name' => 'React',
                    'pass_threshold_percentage' => 70.0
                ]
            ],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'competency_uuids' => ['comp-1']
                        ]
                    ]
                ]
            ]
        ];

        $scores = [
            // q-1: -5 / 10
            new QuestionScoreDto('q-1', 10.0, -5.0, 5.0, false, 'EXACT_MATCH', '')
        ];

        $results = $this->service->evaluateCompetencies($blueprint, $scores);

        $this->assertCount(1, $results);
        $this->assertSame(0.0, $results[0]->awardedScore);
        $this->assertSame(0.0, $results[0]->percentage);
        $this->assertFalse($results[0]->passed);
    }

    public function test_returns_empty_when_no_competencies_defined(): void
    {
        $blueprint = ['competencies' => []];
        $scores = [new QuestionScoreDto('q-1', 10.0, 10.0, 0.0, true, 'EXACT_MATCH', '')];

        $results = $this->service->evaluateCompetencies($blueprint, $scores);

        $this->assertEmpty($results);
    }
}
