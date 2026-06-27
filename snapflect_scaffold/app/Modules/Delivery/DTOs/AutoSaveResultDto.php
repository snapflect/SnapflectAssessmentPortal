<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class AutoSaveResultDto
{
    public function __construct(
        public string $attemptUuid,
        public string $questionUuid,
        public string $answerUuid,
        public string $savedAt,
        public string $serverDraftVersion,
        public bool $success
    ) {
    }
}
