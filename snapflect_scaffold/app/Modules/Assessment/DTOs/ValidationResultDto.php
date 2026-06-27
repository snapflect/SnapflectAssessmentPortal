<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

readonly class ValidationResultDto
{
    public function __construct(
        public string $assessmentUuid,
        public bool $isValid,
        public bool $readyForPublication,
        public array $validationErrors,
        public string $validatedAt
    ) {
    }
}
