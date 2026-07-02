<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class AutoSaveDto
{
    public function __construct(
        public string $attemptUuid,
        public string $questionUuid,
        public mixed $answerPayload,
        public string $clientDraftVersion
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
