<?php

declare(strict_types=1);

namespace App\Modules\Results\Strategies;

class ScoringStrategyResolver
{
    public const STRATEGY_EXACT_MATCH = 'EXACT_MATCH';
    public const STRATEGY_PROPORTIONAL = 'PROPORTIONAL';
    public const STRATEGY_ALL_OR_NOTHING = 'ALL_OR_NOTHING';

    public static function resolve(string $questionType, array $questionDef): string
    {
        if ($questionType === 'single_choice') {
            return self::STRATEGY_EXACT_MATCH;
        }

        if ($questionType === 'multiple_choice') {
            $partialCredit = $questionDef['partial_credit_strategy'] ?? 'all_or_nothing';
            
            if ($partialCredit === 'proportional') {
                return self::STRATEGY_PROPORTIONAL;
            }
            
            return self::STRATEGY_ALL_OR_NOTHING;
        }

        return self::STRATEGY_EXACT_MATCH; // fallback
    }
}
