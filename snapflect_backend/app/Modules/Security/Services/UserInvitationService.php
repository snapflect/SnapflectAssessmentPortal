<?php

declare(strict_types=1);

namespace App\Modules\Security\Services;

use App\Modules\Governance\Models\Organization;
use App\Modules\Security\Models\User;
use App\Mail\UserInviteMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use App\Core\Exceptions\EntityNotFoundException;
use App\Core\Exceptions\TenantValidationException;

class UserInvitationService
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    public function inviteUser(Organization $organization, string $email, string $roleCode, ?int $assignerId = null): void
    {
        // 1. Validate the role FIRST before touching the users table
        $role = \App\Modules\Security\Models\Role::where('role_code', $roleCode)
            ->where(function($q) use ($organization) {
                $q->whereNull('organization_id')
                  ->orWhere('organization_id', $organization->id);
            })->first();

        if (!$role) {
            throw new EntityNotFoundException("Role with code {$roleCode} not found or not applicable to this organization.");
        }

        // 2. Check if user already exists
        $user = User::where('email', $email)->first();

        if ($user) {
            // User exists. Check if they belong to this org.
            if ($user->organization_id !== $organization->id) {
                throw new TenantValidationException("Email is already in use by another workspace.");
            }
            
            // Check if they are already active
            if ($user->status === 'ACTIVE') {
                throw new TenantValidationException("User {$email} is already an active member of this workspace.");
            }
        } else {
            // Create user in PENDING status
            $user = User::create([
                'organization_id' => $organization->id,
                'first_name' => 'Invited',
                'last_name' => 'User',
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'status' => 'PENDING',
            ]);
        }

        // 3. Assign the specified role
        $this->userService->assignRole($user->uuid, $role->uuid, $assignerId ?? auth()->id() ?? 1);

        // Generate password reset token
        $token = Password::broker()->createToken($user);

        // Build the claim URL mapped to the tenant's domain
        $tenantId = strtolower($organization->organization_code ?? $organization->uuid);
        $claimUrl = "http://{$tenantId}.snapflect.localhost:4200/auth/claim-account?token={$token}&email=" . urlencode($email);

        // Dispatch the invitation email
        Mail::to($email)->send(new UserInviteMail($claimUrl, $organization->organization_name, $role ? $role->role_name : $roleCode));
    }
}
