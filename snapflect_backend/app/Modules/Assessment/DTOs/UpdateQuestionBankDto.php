<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateQuestionBankDto extends BaseDto
{
    public ?int $organization_id;
    public ?string $bank_name;
    public ?string $description;
    public ?string $status;

    public function __construct(
        ?int $organization_id = null, ?string $bank_name = null, ?string $description = null, ?string $status = null
    ) {
        $this->organization_id = $organization_id;
        $this->bank_name = $bank_name;
        $this->description = $description;
        $this->status = $status;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['organization_id'] ?? null,
            $data['bank_name'] ?? null,
            $data['description'] ?? null,
            $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
