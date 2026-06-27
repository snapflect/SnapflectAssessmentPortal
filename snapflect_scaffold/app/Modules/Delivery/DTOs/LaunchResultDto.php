<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class LaunchResultDto
{
    public function __construct(
        public string $sessionUuid,
        public string $attemptUuid,
        public string $snapshotUuid,
        public string $launchedAt,
        public string $launchedByUuid
    ) {
    }
}
