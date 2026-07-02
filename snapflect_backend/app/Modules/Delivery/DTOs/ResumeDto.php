<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class ResumeDto
{
    public function __construct(
        public string $attemptUuid
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
