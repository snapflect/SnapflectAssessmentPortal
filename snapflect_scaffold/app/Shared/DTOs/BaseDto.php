<?php

declare(strict_types=1);

namespace App\Shared\DTOs;

abstract readonly class BaseDto
{
    abstract public static function fromArray(array $data): self;
    abstract public function toArray(): array;
}
