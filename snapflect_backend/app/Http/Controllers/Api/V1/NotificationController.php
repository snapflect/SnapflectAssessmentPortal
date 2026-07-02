<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Fetch user notifications
     * GET /api/v1/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $perPage = $request->input('per_page', 20);
        $notifications = $user->notifications()->paginate($perPage);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'unread_count' => $user->unreadNotifications()->count(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    /**
     * Mark a notification as read
     * POST /api/v1/notifications/{id}/read
     */
    public function markAsRead(string $id, Request $request): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->find($id);
        
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'status' => 'success',
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }

    /**
     * Mark all notifications as read
     * POST /api/v1/notifications/read-all
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'status' => 'success',
            'unread_count' => 0
        ]);
    }
}
