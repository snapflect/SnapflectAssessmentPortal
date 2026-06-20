<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class RecalculateResultDto extends BaseDto
{
    public function __construct(
        public string $result_uuid,
        public string $recalculation_reason
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            recalculation_reason: $data['recalculation_reason'] ?? ''
        );
    }

    public function toArray(): array
    {
        return [
            'result_uuid' => $this->result_uuid,
            'recalculation_reason' => $this->recalculation_reason,
        ];
    }
}
