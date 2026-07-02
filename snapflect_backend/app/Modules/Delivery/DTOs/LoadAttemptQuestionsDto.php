<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class LoadAttemptQuestionsDto
{
    public function __construct(
        public string $attempt_uuid,
        public ?string $section_uuid
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'section_uuid' => $this->section_uuid,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['section_uuid'] ?? null
        );
    }
}
