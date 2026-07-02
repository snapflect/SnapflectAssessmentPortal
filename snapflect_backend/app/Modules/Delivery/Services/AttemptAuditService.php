<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Repositories\Interfaces\AttemptEventRepositoryInterface;
use App\Modules\Delivery\DTOs\CreateAttemptEventDto;
use App\Modules\Delivery\DTOs\CreateAttemptAuditDto;
use Illuminate\Support\Facades\DB;

class AttemptAuditService
{
    public function __construct(
        private readonly AttemptEventRepositoryInterface $eventRepository
    ) {}

    public function createEvent(CreateAttemptEventDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            return [];
        });
    }

    public function createAudit(CreateAttemptAuditDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            return [];
        });
    }

    public function recordAnswerChange(string $attemptUuid, array $oldValue, array $newValue): void
    {
        DB::transaction(function () use ($attemptUuid, $oldValue, $newValue) {
            // Store specific attempt audit change
        });
    }

    public function recordSubmission(string $attemptUuid): void
    {
        DB::transaction(function () use ($attemptUuid) {
            // Store submission event
        });
    }

    public function recordSessionAction(string $sessionUuid, string $action): void
    {
        DB::transaction(function () use ($sessionUuid, $action) {
            // Store session event
        });
    }
}
