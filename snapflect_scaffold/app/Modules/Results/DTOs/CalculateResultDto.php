<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CalculateResultDto extends BaseDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $calculation_reason
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            attempt_uuid: $data['attempt_uuid'] ?? '',
            calculation_reason: $data['calculation_reason'] ?? 'Initial calculation'
        );
    }

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'calculation_reason' => $this->calculation_reason,
        ];
    }
}
