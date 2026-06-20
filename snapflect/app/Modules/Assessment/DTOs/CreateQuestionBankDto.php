<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateQuestionBankDto extends BaseDto
{
    public string $bank_code;\n    public string $bank_name;\n    public ?string $description;

    public function __construct(
        string $bank_code = null, string $bank_name = null, ?string $description = null
    ) {
        $this->bank_code = $bank_code;\n        $this->bank_name = $bank_name;\n        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['bank_code'] ?? null,\n            $data['bank_name'] ?? null,\n            $data['description'] ?? null
        );
    }

}
