<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateQuestionBankDto extends BaseDto
{
    public ?string $bank_name;\n    public ?string $description;\n    public ?string $status;

    public function __construct(
        ?string $bank_name = null, ?string $description = null, ?string $status = null
    ) {
        $this->bank_name = $bank_name;\n        $this->description = $description;\n        $this->status = $status;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['bank_name'] ?? null,\n            $data['description'] ?? null,\n            $data['status'] ?? null
        );
    }

    public function toArray(): ?array
    {
        return ?array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
