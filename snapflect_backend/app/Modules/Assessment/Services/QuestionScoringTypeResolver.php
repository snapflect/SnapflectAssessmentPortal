<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

class QuestionScoringTypeResolver
{
    private const AUTO_SCORED_TYPES = [
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'TRUE_FALSE',
        'MATCHING',
        'NUMERIC',
        'FILL_IN_THE_BLANK'
    ];

    private const MANUAL_SCORED_TYPES = [
        'ESSAY',
        'DESCRIPTIVE',
        'MANUAL_EVALUATION'
    ];

    public static function isAutoScored(string $questionType): bool
    {
        return in_array(strtoupper($questionType), self::AUTO_SCORED_TYPES, true);
    }

    public static function isManualScored(string $questionType): bool
    {
        return in_array(strtoupper($questionType), self::MANUAL_SCORED_TYPES, true);
    }
}
