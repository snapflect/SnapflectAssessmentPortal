<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Eloquent;

use App\Modules\Delivery\Repositories\Interfaces\AttemptEventRepositoryInterface;
use App\Modules\Delivery\Models\AttemptEvent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AttemptEventRepository implements AttemptEventRepositoryInterface
{
    public function createEvent(array $data): AttemptEvent
    {
        return AttemptEvent::create($data);
    }

    public function getAttemptTimeline(int $attemptId): Collection
    {
        return AttemptEvent::where('assessment_attempt_id', $attemptId)
            ->orderBy('event_timestamp', 'asc')
            ->get();
    }

    public function getEventsByType(int $attemptId, string $eventType): Collection
    {
        return AttemptEvent::where('assessment_attempt_id', $attemptId)
            ->where('event_type', $eventType)
            ->orderBy('event_timestamp', 'asc')
            ->get();
    }

    public function query(): Builder
    {
        return AttemptEvent::query();
    }
}
