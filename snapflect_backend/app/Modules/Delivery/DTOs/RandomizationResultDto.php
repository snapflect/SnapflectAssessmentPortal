<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class RandomizationResultDto
{
    public function __construct(
        public string $attemptUuid,
        public string $snapshotUuid,
        public string $seed,
        public string $snapshotSchemaVersion,
        public bool $questionRandomized,
        public bool $optionRandomized,
        public string $randomizedAt,
        public ?string $startedAt,
        public ?string $expiresAt,
        public ?string $snapshotJson = null
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
