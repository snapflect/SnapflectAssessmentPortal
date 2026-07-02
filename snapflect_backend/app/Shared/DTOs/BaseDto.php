<?php

declare(strict_types=1);

namespace App\Shared\DTOs;

abstract readonly class BaseDto
{
    abstract public static function fromArray(array $data): self;
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
