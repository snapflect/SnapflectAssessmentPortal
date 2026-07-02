<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

class SeedGenerationService
{
    /**
     * Generates a purely deterministic string seed combining UUIDs securely.
     */
    public function generate(string $assessmentUuid, string $candidateUuid, string $sessionUuid): string
    {
        // SHA256 of the concatenated UUIDs
        return hash('sha256', $assessmentUuid . $candidateUuid . $sessionUuid);
    }
}
