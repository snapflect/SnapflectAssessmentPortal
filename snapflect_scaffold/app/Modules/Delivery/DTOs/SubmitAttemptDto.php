<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class SubmitAttemptDto
{
    public function __construct(
        public string $attemptUuid
    ) {
    }
}
