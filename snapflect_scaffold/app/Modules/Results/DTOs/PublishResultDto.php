<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class PublishResultDto extends BaseDto
{
    public function __construct(
        public string $result_uuid,
        public ?string $publication_notes
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            publication_notes: $data['publication_notes'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'result_uuid' => $this->result_uuid,
            'publication_notes' => $this->publication_notes,
        ];
        return array_filter($data, fn($value) => !is_null($value));
    }
}
