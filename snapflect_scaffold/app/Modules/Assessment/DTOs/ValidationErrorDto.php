<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

readonly class ValidationErrorDto
{
    public function __construct(
        public string $rule,
        public string $message
    ) {
    }
}
