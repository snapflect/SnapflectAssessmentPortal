<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateQuestionBankDto extends BaseDto
{
    public ?int $organization_id;
    public string $bank_code;
    public string $bank_name;
    public ?string $description;

    public function __construct(
        ?int $organization_id = null, string $bank_code = null, string $bank_name = null, ?string $description = null
    ) {
        $this->organization_id = $organization_id;
        $this->bank_code = $bank_code;
        $this->bank_name = $bank_name;
        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['organization_id'] ?? null,
            $data['bank_code'] ?? null,
            $data['bank_name'] ?? null,
            $data['description'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
