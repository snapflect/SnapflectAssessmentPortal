<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class QuestionOptionDto extends BaseDto
{
public string $option_text;
public int $display_order;
public bool $is_correct;

    public function __construct(
        string $option_text = null, int $display_order = null, bool $is_correct = null
    ) {
$this->option_text = $option_text;
$this->display_order = $display_order;
$this->is_correct = $is_correct;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['option_text'] ?? null,
            $data['display_order'] ?? null,
            $data['is_correct'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
