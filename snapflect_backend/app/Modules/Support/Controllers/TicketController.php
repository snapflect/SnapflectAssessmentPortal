<?php

namespace App\Modules\Support\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Modules\Support\Models\SupportTicket;
use App\Modules\Support\Models\SupportTicketReply;
use Illuminate\Support\Str;
use App\Modules\Security\Models\User;
use App\Modules\Governance\Models\Organization;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = SupportTicket::with(['user', 'assignee', 'organization'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc');

        // Segregation Logic
        // Check if user is a PLATFORM_ADMIN or belongs to the master organization
        $isPlatformAdmin = $user->roles()->where('role_code', 'PLATFORM_ADMIN')->exists();
        $org = Organization::find($user->organization_id);
        
        $isPlatformWideSupport = $isPlatformAdmin || ($org && $org->organization_code === 'ORG-001');

        if ($isPlatformWideSupport) {
            // Platform Wide Support: Can see ALL tickets (no organization filter)
            // Can optionally filter by organization_id if passed in request
            if ($request->has('organization_id')) {
                $query->where('organization_id', $request->organization_id);
            }
        } else {
            // Client Wide Support / Regular User
            // They can only see tickets for their own organization
            $query->where('organization_id', $user->organization_id);
            
            // If they are just a regular user (not SUPPORT or CLIENT_ADMIN), they only see their OWN tickets
            $hasSupportPerms = $user->hasPermission('Support.Tickets.View') || $user->hasPermission('Support.Tickets.Manage');
            if (!$hasSupportPerms) {
                $query->where('user_id', $user->id);
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->paginate(20)
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $ticket = SupportTicket::with(['user', 'assignee', 'organization', 'replies.user'])->findOrFail($id);

        // Security check
        $isPlatformAdmin = $user->roles()->where('role_code', 'PLATFORM_ADMIN')->exists();
        $org = Organization::find($user->organization_id);
        $isPlatformWideSupport = $isPlatformAdmin || ($org && $org->organization_code === 'ORG-001');

        if (!$isPlatformWideSupport) {
            if ($ticket->organization_id !== $user->organization_id) {
                return response()->json(['error' => 'Unauthorized access to this ticket'], 403);
            }
            
            $hasSupportPerms = $user->hasPermission('Support.Tickets.View') || $user->hasPermission('Support.Tickets.Manage');
            if (!$hasSupportPerms && $ticket->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized access to this ticket'], 403);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $ticket
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'nullable|string|in:LOW,MEDIUM,HIGH,CRITICAL'
        ]);

        $user = $request->user();

        $ticket = SupportTicket::create([
            'uuid' => Str::uuid(),
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => 'OPEN',
            'priority' => $request->priority ?? 'MEDIUM',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket created successfully',
            'data' => $ticket
        ], 201);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $user = $request->user();
        $ticket = SupportTicket::findOrFail($id);

        // Security check
        $isPlatformAdmin = $user->roles()->where('role_code', 'PLATFORM_ADMIN')->exists();
        $org = Organization::find($user->organization_id);
        $isPlatformWideSupport = $isPlatformAdmin || ($org && $org->organization_code === 'ORG-001');

        if (!$isPlatformWideSupport) {
            if ($ticket->organization_id !== $user->organization_id) {
                return response()->json(['error' => 'Unauthorized access to this ticket'], 403);
            }
            $hasSupportPerms = $user->hasPermission('Support.Tickets.View') || $user->hasPermission('Support.Tickets.Manage');
            if (!$hasSupportPerms && $ticket->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized access to this ticket'], 403);
            }
        }

        $reply = SupportTicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message
        ]);

        // If a support agent replies, change status to IN_PROGRESS (if it's still OPEN)
        if ($user->id !== $ticket->user_id && $ticket->status === 'OPEN') {
            $ticket->status = 'IN_PROGRESS';
            if (!$ticket->assigned_to) {
                $ticket->assigned_to = $user->id;
            }
            $ticket->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Reply added successfully',
            'data' => $reply->load('user')
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $user = $request->user();
        $ticket = SupportTicket::findOrFail($id);

        if (!$user->hasPermission('Support.Tickets.Manage')) {
            return response()->json(['error' => 'Insufficient permissions to update ticket status'], 403);
        }

        // Security check
        $isPlatformAdmin = $user->roles()->where('role_code', 'PLATFORM_ADMIN')->exists();
        $org = Organization::find($user->organization_id);
        $isPlatformWideSupport = $isPlatformAdmin || ($org && $org->organization_code === 'ORG-001');

        if (!$isPlatformWideSupport && $ticket->organization_id !== $user->organization_id) {
             return response()->json(['error' => 'Unauthorized access to this ticket'], 403);
        }

        $ticket->status = $request->status;
        if ($request->has('assigned_to')) {
            $ticket->assigned_to = $request->assigned_to;
        }
        $ticket->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket status updated successfully',
            'data' => $ticket
        ]);
    }
}
