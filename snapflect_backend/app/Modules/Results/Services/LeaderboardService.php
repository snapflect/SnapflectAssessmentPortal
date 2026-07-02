<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\LeaderboardEntryDto;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LeaderboardService
{
    /**
     * @param string $assessmentUuid
     * @param string|null $currentUserUuid
     * @param int $limit
     * @return LeaderboardEntryDto[]
     */
    public function generateLeaderboard(string $assessmentUuid, ?string $currentUserUuid = null, int $limit = 50): array
    {
        // 1. Validate Blueprint Leaderboard Settings
        $assessment = DB::table('assessments')->where('uuid', $assessmentUuid)->first();
        if (!$assessment) {
            return [];
        }

        // We assume settings are part of a config JSON or columns
        // e.g. json_decode($assessment->settings)->leaderboard_enabled
        // For this implementation, we proceed if it exists.

        // 2. Fetch Ranking Data
        // Rules: 
        // - overall_score DESC
        // - time_taken ASC (completed_at - started_at)
        // - completed_at ASC
        $results = DB::table('assessment_results')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->join('users', 'assessment_attempts.user_id', '=', 'users.id')
            ->where('assessment_attempts.assessment_id', $assessment->id)
            ->where('assessment_results.result_status', 'PUBLISHED')
            ->where('assessment_results.pass_fail_status', 'PASS') // Only passing scores make the leaderboard
            // Use subquery to get only the latest active version per attempt, or simply rely on PUBLISHED state logic
            // In our system, PUBLISHED is unique per attempt.
            ->select(
                'users.uuid as user_uuid',
                'users.name as candidate_name',
                'users.privacy_opt_out',
                'assessment_results.overall_score as score',
                DB::raw('TIMESTAMPDIFF(SECOND, assessment_attempts.started_at, assessment_attempts.completed_at) as time_taken_seconds'),
                'assessment_attempts.completed_at'
            )
            ->orderByDesc('assessment_results.overall_score')
            ->orderBy('time_taken_seconds')
            ->orderBy('assessment_attempts.completed_at')
            ->limit($limit)
            ->get();

        $snapshotDate = Carbon::now()->toIso8601String();
        $dtos = [];
        $rank = 1;

        // 3. Apply Privacy Masking & Map to DTO
        foreach ($results as $row) {
            $isCurrentUser = ($currentUserUuid !== null && $row->user_uuid === $currentUserUuid);
            
            // Privacy governance: Hide name if opted out (unless it's the current user viewing their own row)
            $displayName = $row->candidate_name;
            if ($row->privacy_opt_out && !$isCurrentUser) {
                $displayName = 'Anonymous Candidate';
            }

            $dtos[] = new LeaderboardEntryDto(
                rank: $rank++,
                candidateName: $displayName,
                score: (float) $row->score,
                timeTakenSeconds: (int) $row->time_taken_seconds,
                isCurrentUser: $isCurrentUser,
                rankSnapshotDate: $snapshotDate
            );
        }

        return $dtos;
    }
}
