<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Security\Models\User;

class TelemetryController extends Controller
{
    public function getTelemetry(Request $request): JsonResponse
    {
        $organizationId = $request->user() ? $request->user()->organization_id : 1;

        // Get all launched sessions with candidate relationships
        $sessions = AssessmentSession::with(['candidate', 'latestAttempt'])
            ->where('organization_id', $organizationId)
            ->where('session_status', 'LAUNCHED')
            ->get();

        $totalActive = $sessions->count();
        $flaggedSessions = 0;
        $networkWarnings = 0;
        $totalCompletion = 0;
        $completionCount = 0;
        
        $sessionData = [];

        foreach ($sessions as $session) {
            $status = 'Healthy';
            $latency = $session->latency_ms ?? 0;
            
            if ($latency > 200) {
                $status = 'Warning';
                $networkWarnings++;
            }

            $attempt = $session->latestAttempt;
            if ($attempt && $attempt->status === 'IN_PROGRESS') {
                $totalCompletion += (int) $attempt->completion_percentage;
                $completionCount++;
                
                // Assuming we had a flagged_questions count or similar. For now, mock if no actual flag tracking exists.
                // In a real system, you'd check events or questions.
                // Let's assume there's a has_flagged_events boolean or similar, or just 0 for now.
                // Actually, if we want a dummy flagged, let's just use 0 unless we add a column.
                // $flaggedSessions++;
            }

            $sessionData[] = [
                'id' => $session->uuid,
                'candidate' => $session->candidate ? $session->candidate->first_name . ' ' . $session->candidate->last_name : 'Unknown',
                'email' => $session->candidate ? $session->candidate->email : '',
                'ip' => $session->ip_address ?? 'Unknown',
                'status' => $status,
                'latency' => $latency
            ];
        }

        $avgCompletion = $completionCount > 0 ? round($totalCompletion / $completionCount) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_active' => $totalActive,
                'flagged_sessions' => $flaggedSessions,
                'network_warnings' => $networkWarnings,
                'avg_completion' => $avgCompletion,
                'sessions' => $sessionData
            ]
        ]);
    }
}
