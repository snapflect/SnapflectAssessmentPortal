<?php

declare(strict_types=1);

namespace App\Modules\Results\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\Results\Services\ScoringOrchestratorService;
use Illuminate\Support\Facades\Log;

class ScoreAssessmentAttemptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 3;
    public $timeout = 120;

    public function __construct(
        public readonly string $attemptUuid
    ) {}

    public function handle(ScoringOrchestratorService $scoringOrchestrator, \App\Modules\Results\Services\CertificateGenerationService $certService): void
    {
        Log::info("Starting background scoring for attempt: {$this->attemptUuid}");
        
        try {
            $resultDto = $scoringOrchestrator->executeScoringPipeline($this->attemptUuid);
            Log::info("Successfully scored attempt: {$this->attemptUuid}");
            
            try {
                $certService->generateForAttemptIfEligible($this->attemptUuid, $resultDto->version);
            } catch (\Exception $e) {
                Log::error("Certificate generation failed for attempt: {$this->attemptUuid}", ['error' => $e->getMessage()]);
            }
            
        } catch (\Exception $e) {
            Log::error("Failed to score attempt: {$this->attemptUuid}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Job failed entirely for attempt: {$this->attemptUuid}");
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $this->attemptUuid)->first();
        if ($attempt) {
            $attempt->status = 'ERROR'; // or SCORING_FAILED depending on the frontend's expected states
            $attempt->save();
        }
    }
}
