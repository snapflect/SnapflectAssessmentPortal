<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\Governance\Models\Organization;
use App\Modules\Security\Services\UserInvitationService;

class ProvisionTenantUsersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Organization $organization
    ) {}

    /**
     * Execute the job.
     */
    public function handle(UserInvitationService $invitationService): void
    {
        // 1. Provision Primary Account Owner
        if ($this->organization->contact_email) {
            $invitationService->inviteUser($this->organization, $this->organization->contact_email, 'CLIENT_ADMIN', $this->organization->created_by);
        }

        // 2. Provision Pending Invites
        $pendingInvites = $this->organization->pending_invites ?? [];
        foreach ($pendingInvites as $invite) {
            $email = $invite['email'] ?? null;
            $role = $invite['role'] ?? 'viewer'; // Default fallback role

            // Convert UI role aliases to actual DB role codes
            $roleCodeMap = [
                'admin' => 'CLIENT_ADMIN',
                'billing' => 'BILLING_ADMIN',
                'viewer' => 'READ_ONLY'
            ];
            $roleCode = $roleCodeMap[$role] ?? 'READ_ONLY';

            if ($email) {
                $invitationService->inviteUser($this->organization, $email, $roleCode, $this->organization->created_by);
            }
        }

        // 3. Clear pending invites now that they have been processed
        if (!empty($pendingInvites)) {
            $this->organization->pending_invites = null;
            $this->organization->save();
        }
    }
}
