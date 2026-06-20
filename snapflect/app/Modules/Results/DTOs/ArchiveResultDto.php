<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class ArchiveResultDto extends BaseDto
{
    public function __construct(
        public string $result_uuid,
        public ?string $archive_reason
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            archive_reason: $data['archive_reason'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'result_uuid' => $this->result_uuid,
            'archive_reason' => $this->archive_reason,
        ];
        return array_filter($data, fn($value) => !is_null($value));
    }
}
