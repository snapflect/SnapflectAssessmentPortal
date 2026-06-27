<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Exceptions\SessionLaunchException;

class SessionStateMachine
{
    public const STATE_DRAFT = 'DRAFT';
    public const STATE_LAUNCHED = 'LAUNCHED';
    public const STATE_CANCELLED = 'CANCELLED';

    private const ALLOWED_TRANSITIONS = [
        self::STATE_DRAFT => [self::STATE_LAUNCHED, self::STATE_CANCELLED],
        self::STATE_LAUNCHED => [],
        self::STATE_CANCELLED => []
    ];

    public function canTransition(string $from, string $to): bool
    {
        if ($from === $to) {
            return in_array($from, [self::STATE_LAUNCHED, self::STATE_CANCELLED], true);
        }

        $allowed = self::ALLOWED_TRANSITIONS[$from] ?? [];
        return in_array($to, $allowed, true);
    }

    public function transition(string $from, string $to): string
    {
        if ($from === $to && in_array($from, [self::STATE_LAUNCHED, self::STATE_CANCELLED], true)) {
            return $to; // Idempotent
        }

        if (!$this->canTransition($from, $to)) {
            throw new SessionLaunchException(
                SessionLaunchException::INVALID_SESSION_STATE,
                "Cannot transition session from {$from} to {$to}"
            );
        }

        return $to;
    }
}
