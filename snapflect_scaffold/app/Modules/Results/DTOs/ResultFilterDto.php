<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class ResultFilterDto extends BaseDto
{
    public function __construct(
        public ?string $status,
        public ?string $pass_fail_status,
        public ?string $candidate_uuid,
        public ?string $assessment_uuid,
        public ?int $limit,
        public ?int $offset
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            status: $data['status'] ?? null,
            pass_fail_status: $data['pass_fail_status'] ?? null,
            candidate_uuid: $data['candidate_uuid'] ?? null,
            assessment_uuid: $data['assessment_uuid'] ?? null,
            limit: isset($data['limit']) ? (int)$data['limit'] : null,
            offset: isset($data['offset']) ? (int)$data['offset'] : null
        );
    }

    public function toArray(): array
    {
        $data = [
            'status' => $this->status,
            'pass_fail_status' => $this->pass_fail_status,
            'candidate_uuid' => $this->candidate_uuid,
            'assessment_uuid' => $this->assessment_uuid,
            'limit' => $this->limit,
            'offset' => $this->offset,
        ];
        return array_filter($data, fn($value) => !is_null($value));
    }
}
