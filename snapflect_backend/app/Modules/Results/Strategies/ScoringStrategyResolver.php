<?php

declare(strict_types=1);

namespace App\Modules\Results\Strategies;

class ScoringStrategyResolver
{
    public const STRATEGY_EXACT_MATCH = 'EXACT_MATCH';
    public const STRATEGY_PROPORTIONAL = 'PROPORTIONAL';
    public const STRATEGY_ALL_OR_NOTHING = 'ALL_OR_NOTHING';
    public const STRATEGY_TEXT_MATCH = 'TEXT_MATCH';
    public const STRATEGY_NUMERIC_MATCH = 'NUMERIC_MATCH';
    public const STRATEGY_MANUAL_REVIEW = 'MANUAL_REVIEW';

    public static function resolve(string $questionType, array $questionDef): string
    {
        $normalizedType = strtolower(trim($questionType));
        
        if ($normalizedType === 'single_choice' || $normalizedType === 'mcq' || $normalizedType === 'true_false') {
            return self::STRATEGY_EXACT_MATCH;
        }

        if ($normalizedType === 'multiple_choice' || $normalizedType === 'multiple_select') {
            $partialCredit = $questionDef['partial_credit_strategy'] ?? 'all_or_nothing';
            
            if ($partialCredit === 'proportional') {
                return self::STRATEGY_PROPORTIONAL;
            }
            
            return self::STRATEGY_ALL_OR_NOTHING;
        }

        if ($normalizedType === 'fill_in_the_blank' || $normalizedType === 'short_answer') {
            return self::STRATEGY_TEXT_MATCH;
        }

        if ($normalizedType === 'numeric') {
            return self::STRATEGY_NUMERIC_MATCH;
        }
        
        if (in_array($normalizedType, ['essay', 'subjective', 'descriptive', 'file_upload'], true)) {
            return self::STRATEGY_MANUAL_REVIEW;
        }

        return self::STRATEGY_EXACT_MATCH; // fallback
    }
}
