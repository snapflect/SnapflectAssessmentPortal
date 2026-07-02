<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class LaunchSessionDto
{
    public function __construct(
        public string $sessionUuid
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
