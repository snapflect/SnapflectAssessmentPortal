<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

class LeaderboardEntryDto
{
    public function __construct(
        public readonly int $rank,
        public readonly string $candidateName,
        public readonly float $score,
        public readonly int $timeTakenSeconds,
        public readonly bool $isCurrentUser,
        public readonly ?string $rankSnapshotDate = null
    ) {
    }

    public function toArray(): array
    {
        return [
            'rank' => $this->rank,
            'candidateName' => $this->candidateName,
            'score' => $this->score,
            'timeTakenSeconds' => $this->timeTakenSeconds,
            'isCurrentUser' => $this->isCurrentUser,
            'rankSnapshotDate' => $this->rankSnapshotDate,
        ];
    }
}
