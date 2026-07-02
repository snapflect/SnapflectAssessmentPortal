<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class ResumeResultDto
{
    public function __construct(
        public string $attemptUuid,
        public string $snapshotUuid,
        public string $randomizationSeed,
        public array $questionOrder,
        public array $optionOrder,
        public array $draftAnswers,
        public int $remainingSeconds,
        public float $completionPercentage,
        public string $status,
        public string $serverTime,
        public bool $expired,
        public string $snapshotSchemaVersion,
        public ?string $expiresAt = null,
        public ?string $snapshotJson = null
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
