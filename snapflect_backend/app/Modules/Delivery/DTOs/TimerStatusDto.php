<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class TimerStatusDto
{
    public function __construct(
        public string $attemptUuid,
        public string $currentState,
        public ?string $startedAt,
        public ?string $expiresAt,
        public int $remainingSeconds,
        public bool $expired,
        public bool $withinGracePeriod,
        public int $gracePeriodSeconds,
        public string $serverTime
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
