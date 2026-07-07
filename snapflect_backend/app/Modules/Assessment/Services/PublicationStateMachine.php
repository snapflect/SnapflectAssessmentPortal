<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\Exceptions\AssessmentPublicationException;

class PublicationStateMachine
{
    public const STATE_DRAFT = 'DRAFT';
    public const STATE_IN_REVIEW = 'IN_REVIEW';
    public const STATE_APPROVED = 'APPROVED';
    public const STATE_PUBLISHED = 'PUBLISHED';
    public const STATE_ARCHIVED = 'ARCHIVED';

    private const ALLOWED_TRANSITIONS = [
        self::STATE_DRAFT    => [self::STATE_IN_REVIEW, self::STATE_APPROVED],
        self::STATE_IN_REVIEW => [self::STATE_APPROVED, self::STATE_DRAFT], // Draft is for reject
        self::STATE_APPROVED => [self::STATE_PUBLISHED],
        self::STATE_PUBLISHED => [self::STATE_ARCHIVED],
        self::STATE_ARCHIVED => []
    ];

    public function canTransition(string $from, string $to): bool
    {
        // Idempotent transition is always allowed conceptually, though handled differently in service
        if ($from === $to) {
            return true;
        }

        $allowed = self::ALLOWED_TRANSITIONS[$from] ?? [];
        return in_array($to, $allowed, true);
    }

    public function transition(string $from, string $to): string
    {
        if ($from === $to) {
            return $to; // Idempotent
        }

        if (!$this->canTransition($from, $to)) {
            throw new AssessmentPublicationException(
                AssessmentPublicationException::INVALID_TRANSITION,
                "Cannot transition assessment from {$from} to {$to}"
            );
        }

        return $to;
    }

    public static function isMutable(string $status): bool
    {
        return in_array($status, [self::STATE_DRAFT, self::STATE_IN_REVIEW, self::STATE_APPROVED], true);
    }
}
