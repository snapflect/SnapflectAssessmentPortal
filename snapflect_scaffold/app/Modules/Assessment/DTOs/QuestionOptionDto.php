<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class QuestionOptionDto extends BaseDto
{
    public string $option_text;\n    public int $display_order;\n    public bool $is_correct;

    public function __construct(
        string $option_text = null, int $display_order = null, bool $is_correct = null
    ) {
        $this->option_text = $option_text;\n        $this->display_order = $display_order;\n        $this->is_correct = $is_correct;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['option_text'] ?? null,\n            $data['display_order'] ?? null,\n            $data['is_correct'] ?? null
        );
    }

}
