<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Delivery\Models\AssessmentSession;
use Carbon\Carbon;

class ProctoringController extends Controller
{
    public function liveSessions(Request $request): JsonResponse
    {
        $organizationId = $request->user() ? $request->user()->organization_id : 1;

        // Fetch LAUNCHED sessions
        $sessions = AssessmentSession::forUser($request->user())
            ->where('session_status', 'LAUNCHED')
            ->with(['candidate', 'assessment', 'latestAttempt'])
            ->get();

        $liveData = $sessions->map(function ($session) {
            $progress = 0;
            $timeElapsedStr = '00:00:00';
            $attemptUuid = null;

            $attempt = $session->latestAttempt;
            if ($attempt) {
                $attemptUuid = $attempt->uuid;
                
                // Calculate time elapsed
                if ($attempt->started_at) {
                    $diff = Carbon::parse($attempt->started_at)->diff(Carbon::now());
                    $timeElapsedStr = sprintf('%02d:%02d:%02d', ($diff->d * 24) + $diff->h, $diff->i, $diff->s);
                }

                $progress = $attempt->completion_percentage ?? 0;
            }

            return [
                'session_uuid' => $session->uuid,
                'attempt_uuid' => $attemptUuid,
                'candidateName' => $session->candidate ? $session->candidate->first_name . ' ' . $session->candidate->last_name : 'Unknown',
                'email' => $session->candidate ? $session->candidate->email : '',
                'assessmentName' => $session->assessment ? $session->assessment->title : 'Assessment',
                'timeElapsed' => $timeElapsedStr,
                'progress' => (float)$progress,
                // Mock telemetry for Option A
                'cameraOn' => (bool)rand(0, 1),
                'micOn' => (bool)rand(0, 1),
                'flagged' => (bool)rand(0, 1),
                'status' => 'LAUNCHED'
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Live sessions retrieved successfully.',
            'data' => $liveData
        ]);
    }
}
