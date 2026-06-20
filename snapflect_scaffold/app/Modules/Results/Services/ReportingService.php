<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\ResultFilterDto;
use App\Modules\Results\DTOs\ReportingFilterDto;
use Illuminate\Database\Eloquent\Collection;

/**
 * READ ONLY SERVICE
 * No transactions. No writes.
 */
class ReportingService
{
    public function assessmentReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection();
    }

    public function competencyReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection();
    }

    public function passFailReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection();
    }

    public function candidateReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection();
    }
}
