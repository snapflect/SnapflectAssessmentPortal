<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results\Services;

use App\Modules\Results\Services\AutoScoringService;
use App\Modules\Results\Strategies\ScoringStrategyResolver;
use PHPUnit\Framework\TestCase;

class AutoScoringServiceTest extends TestCase
{
    private AutoScoringService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AutoScoringService();
    }

    public function test_single_choice_exact_match_success(): void
    {
        $blueprint = [
            'scoring_rules' => ['negative_marking_penalty' => 0.5],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'question_type' => 'single_choice',
                            'max_score' => 10.0,
                            'options' => [
                                ['uuid' => 'opt-1', 'is_correct' => true],
                                ['uuid' => 'opt-2', 'is_correct' => false],
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $answers = [
            'q-1' => ['payload' => 'opt-1']
        ];

        $results = $this->service->evaluateAttempt($blueprint, $answers);

        $this->assertCount(1, $results);
        $this->assertSame(10.0, $results[0]->awardedScore);
        $this->assertTrue($results[0]->isCorrect);
        $this->assertSame(ScoringStrategyResolver::STRATEGY_EXACT_MATCH, $results[0]->strategyApplied);
    }

    public function test_single_choice_exact_match_failure_applies_negative_marking(): void
    {
        $blueprint = [
            'scoring_rules' => ['negative_marking_penalty' => 0.5],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'question_type' => 'single_choice',
                            'max_score' => 10.0,
                            'options' => [
                                ['uuid' => 'opt-1', 'is_correct' => true],
                                ['uuid' => 'opt-2', 'is_correct' => false],
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $answers = [
            'q-1' => ['payload' => 'opt-2']
        ];

        $results = $this->service->evaluateAttempt($blueprint, $answers);

        $this->assertSame(-0.5, $results[0]->awardedScore);
        $this->assertSame(0.5, $results[0]->penaltyApplied);
        $this->assertFalse($results[0]->isCorrect);
    }

    public function test_unanswered_question_applies_zero_penalty(): void
    {
        $blueprint = [
            'scoring_rules' => ['negative_marking_penalty' => 0.5],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'question_type' => 'single_choice',
                            'max_score' => 10.0,
                            'options' => []
                        ]
                    ]
                ]
            ]
        ];

        $answers = [
            'q-1' => ['payload' => null] // Unanswered
        ];

        $results = $this->service->evaluateAttempt($blueprint, $answers);

        $this->assertSame(0.0, $results[0]->awardedScore);
        $this->assertSame(0.0, $results[0]->penaltyApplied);
        $this->assertFalse($results[0]->isCorrect);
    }

    public function test_multiple_choice_all_or_nothing_success(): void
    {
        $blueprint = [
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'question_type' => 'multiple_choice',
                            'partial_credit_strategy' => 'all_or_nothing',
                            'max_score' => 10.0,
                            'options' => [
                                ['uuid' => 'opt-1', 'is_correct' => true],
                                ['uuid' => 'opt-2', 'is_correct' => true],
                                ['uuid' => 'opt-3', 'is_correct' => false],
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $answers = [
            'q-1' => ['payload' => ['opt-1', 'opt-2']] // Exact set match
        ];

        $results = $this->service->evaluateAttempt($blueprint, $answers);

        $this->assertSame(10.0, $results[0]->awardedScore);
        $this->assertTrue($results[0]->isCorrect);
        $this->assertSame(ScoringStrategyResolver::STRATEGY_ALL_OR_NOTHING, $results[0]->strategyApplied);
    }

    public function test_multiple_choice_all_or_nothing_failure_missed_one(): void
    {
        $blueprint = [
            'scoring_rules' => ['negative_marking_penalty' => 1.0],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'question_type' => 'multiple_choice',
                            'max_score' => 10.0,
                            'options' => [
                                ['uuid' => 'opt-1', 'is_correct' => true],
                                ['uuid' => 'opt-2', 'is_correct' => true],
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $answers = [
            'q-1' => ['payload' => ['opt-1']] // Missed opt-2
        ];

        $results = $this->service->evaluateAttempt($blueprint, $answers);

        $this->assertSame(-1.0, $results[0]->awardedScore);
        $this->assertSame(1.0, $results[0]->penaltyApplied);
        $this->assertFalse($results[0]->isCorrect);
    }

    public function test_multiple_choice_proportional_credit(): void
    {
        $blueprint = [
            'scoring_rules' => ['negative_marking_penalty' => 1.0],
            'sections' => [
                [
                    'questions' => [
                        [
                            'uuid' => 'q-1',
                            'question_type' => 'multiple_choice',
                            'partial_credit_strategy' => 'proportional',
                            'max_score' => 10.0,
                            'options' => [
                                ['uuid' => 'opt-1', 'is_correct' => true],
                                ['uuid' => 'opt-2', 'is_correct' => true],
                                ['uuid' => 'opt-3', 'is_correct' => false],
                            ]
                        ]
                    ]
                ]
            ]
        ];

        // 1 correct (out of 2), 1 incorrect.
        // Award: (1/2) * 10.0 = 5.0
        // Penalty: 1 * 1.0 = 1.0
        // Net: 4.0
        $answers = [
            'q-1' => ['payload' => ['opt-1', 'opt-3']]
        ];

        $results = $this->service->evaluateAttempt($blueprint, $answers);

        $this->assertSame(4.0, $results[0]->awardedScore);
        $this->assertSame(1.0, $results[0]->penaltyApplied);
        $this->assertTrue($results[0]->isCorrect); // net > 0
        $this->assertSame(ScoringStrategyResolver::STRATEGY_PROPORTIONAL, $results[0]->strategyApplied);
    }
}
