<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

readonly class ScoringPersistenceResultDto
{
    public function __construct(
        public string $attemptUuid,
        public string $resultUuid,
        public int $version,
        public string $status,
        public string $persistedAt
    ) {
    }
}
