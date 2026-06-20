<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AttemptEvent;

interface AttemptEventRepositoryInterface
{
    public function createEvent(array $data): AttemptEvent;\n    public function getAttemptTimeline(int $attemptId): Collection;\n    public function getEventsByType(int $attemptId, string $eventType): Collection;\n    public function query(): Builder;
}
