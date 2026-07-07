<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\PublishResultDto;
use App\Modules\Results\DTOs\ArchiveResultDto;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Exceptions\ResultPublicationException;
use Illuminate\Support\Facades\DB;

class PublicationService
{
    public function publish(PublishResultDto $dto, int $organizationId, int $userId): void
    {
        DB::transaction(function () use ($dto, $organizationId, $userId) {
            $result = AssessmentResult::where('uuid', $dto->result_uuid)->firstOrFail();
            
            // State Machine Logic: READY -> PUBLISHED only
            if ($result->result_status !== 'READY') {
                throw new ResultPublicationException('Only READY results can be published.');
            }
            
            $result->result_status = 'PUBLISHED';
            $result->published_at = now();
            $result->save();
            
            // Logic to publish result
            $this->createAudit($result->id ?? 0, 'RESULT_PUBLISHED', 'Result officially published', $organizationId, $userId);
        });
    }

    public function archive(ArchiveResultDto $dto, int $organizationId, int $userId): void
    {
        DB::transaction(function () use ($dto, $organizationId, $userId) {
            $result = AssessmentResult::where('uuid', $dto->result_uuid)->firstOrFail();
            
            // State Machine Logic: PUBLISHED -> ARCHIVED only
            if ($result->result_status !== 'PUBLISHED') {
                throw new ResultPublicationException('Only PUBLISHED results can be archived.');
            }
            
            $result->result_status = 'ARCHIVED';
            $result->save();
            
            // Logic to archive result
            $this->createAudit($result->id ?? 0, 'RESULT_ARCHIVED', 'Result archived', $organizationId, $userId);
        });
    }

    private function createAudit(int $resultId, string $type, string $description, int $organizationId, int $userId): void
    {
        // Audit persistence logic
    }
}
