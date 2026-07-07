<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Services\AssessmentSessionService;
use App\Modules\Delivery\Services\AttemptTimerService;
use Carbon\Carbon;

class ExpireAbandonedSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'delivery:expire-sessions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically expires abandoned sessions and attempts';

    /**
     * Execute the console command.
     */
    public function handle(
        AssessmentSessionService $sessionService,
        AttemptTimerService $timerService
    ) {
        $now = Carbon::now();
        $cutoff24Hours = $now->copy()->subHours(24);

        $this->info('Starting automated cleanup of abandoned sessions and attempts...');

        // 1. Expire Attempts
        $expiredAttempts = AssessmentAttempt::where('status', 'IN_PROGRESS')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', $now)
            ->get();

        $attemptCount = 0;
        foreach ($expiredAttempts as $attempt) {
            try {
                $timerService->expireAttempt($attempt);
                $attemptCount++;
            } catch (\Exception $e) {
                $this->error("Failed to expire attempt {$attempt->uuid}: {$e->getMessage()}");
            }
        }
        $this->info("Expired {$attemptCount} abandoned attempts.");

        // 2. Expire Sessions
        $abandonedSessions = AssessmentSession::whereIn('session_status', ['LAUNCHED', 'PAUSED'])
            ->where(function ($query) use ($now, $cutoff24Hours) {
                $query->where(function ($q) use ($now) {
                    // Timed sessions that have passed their access expiration
                    $q->whereNotNull('access_expires_at')
                      ->where('access_expires_at', '<', $now);
                })->orWhere(function ($q) use ($cutoff24Hours) {
                    // Untimed sessions that have been inactive for > 24 hours (fallback to access_started_at if null)
                    $q->whereNull('access_expires_at')
                      ->where(function ($subQ) use ($cutoff24Hours) {
                          $subQ->whereNotNull('last_activity_at')->where('last_activity_at', '<', $cutoff24Hours)
                               ->orWhere(function ($fallbackQ) use ($cutoff24Hours) {
                                   $fallbackQ->whereNull('last_activity_at')->where('access_started_at', '<', $cutoff24Hours);
                               });
                      });
                });
            })
            ->get();

        $sessionCount = 0;
        foreach ($abandonedSessions as $session) {
            try {
                $sessionService->expireSession($session->uuid);
                $sessionCount++;
            } catch (\Exception $e) {
                $this->error("Failed to expire session {$session->uuid}: {$e->getMessage()}");
            }
        }
        $this->info("Expired {$sessionCount} abandoned sessions.");

        $this->info('Cleanup complete.');
    }
}
