<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Delivery\Models\AssessmentSession;

class NavigationController extends Controller
{
    /**
     * Returns the dynamic menu configuration for the current user/tenant.
     * Includes badge counts for specific modules.
     */
    public function getMenu(Request $request): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1;
        
        $activeSessionsCount = AssessmentSession::where('organization_id', $organizationId)
            ->where('session_status', 'ACTIVE')
            ->count();
            
        $menuConfig = [
            'badges' => [
                'active_sessions' => $activeSessionsCount,
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $menuConfig,
            'message' => 'Navigation configuration retrieved successfully'
        ]);
    }
}
