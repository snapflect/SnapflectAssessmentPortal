<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class ResumeDto
{
    public function __construct(
        public string $attemptUuid
    ) {
    }
}
