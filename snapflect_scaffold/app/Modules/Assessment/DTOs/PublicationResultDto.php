<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

readonly class PublicationResultDto
{
    public function __construct(
        public string $assessmentUuid,
        public string $previousStatus,
        public string $currentStatus,
        public string $transitionedAt,
        public string $transitionedByUuid
    ) {
    }
}
