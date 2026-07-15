<?php

namespace App\Modules\Security\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Modules\Security\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->load(['userProfile', 'roles.permissions', 'organization']);

        // Enforce cross-tenant isolation
        if (!$user->roles->contains('role_code', 'PLATFORM_ADMIN') && $user->organization) {
            $origin = $request->header('Origin') ?? $request->header('Referer') ?? '';
            $host = parse_url($origin, PHP_URL_HOST);
            
            if ($host) {
                $parts = explode('.', $host);
                $subdomain = strtolower($parts[0]);
                $expectedSubdomain = strtolower($user->organization->organization_code ?? $user->organization->uuid);
                
                if ($subdomain !== 'portal' && $subdomain !== 'localhost' && $subdomain !== $expectedSubdomain) {
                    throw ValidationException::withMessages([
                        'email' => ["Your account belongs to '{$user->organization->organization_name}'. You cannot login to this workspace."],
                    ]);
                }
            }
        }

        // Get user profile, roles, and organization to include in response
        $permissions = $user->roles->flatMap->permissions->pluck('permission_code')->unique()->values()->toArray();

        // Generate a mock token string that encodes the email and token_version
        $token = base64_encode(json_encode(['email' => $user->email, 'v' => $user->token_version]));

        return response()->json([
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'organization_id' => $user->organization_id,
                'organization_name' => $user->organization ? $user->organization->organization_name : null,
                'roles' => $user->roles->pluck('role_code')->toArray(),
                'permissions' => $permissions
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->token_version = $user->token_version + 1;
            $user->save();
        }

        return response()->json(['success' => true]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['userProfile', 'roles.permissions', 'organization']);
        
        // Enforce cross-tenant isolation
        if (!$user->roles->contains('role_code', 'PLATFORM_ADMIN') && $user->organization) {
            $origin = $request->header('Origin') ?? $request->header('Referer') ?? '';
            $host = parse_url($origin, PHP_URL_HOST);
            
            if ($host) {
                $parts = explode('.', $host);
                $subdomain = strtolower($parts[0]);
                $expectedSubdomain = strtolower($user->organization->organization_code ?? $user->organization->uuid);
                
                if ($subdomain !== 'portal' && $subdomain !== 'localhost' && $subdomain !== $expectedSubdomain) {
                    abort(403, "Your account belongs to '{$user->organization->organization_name}'. You cannot access this workspace.");
                }
            }
        }

        $permissions = $user->roles->flatMap->permissions->pluck('permission_code')->unique()->values()->toArray();

        return response()->json([
            'access_token' => $request->bearerToken(),
            'user' => [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'organization_id' => $user->organization_id,
                'organization_name' => $user->organization ? $user->organization->organization_name : null,
                'roles' => $user->roles->pluck('role_code')->toArray(),
                'permissions' => $permissions
            ]
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['success' => true]);
    }

    public function claimAccount(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find a user with that email address.'],
            ]);
        }

        $user->load(['roles', 'organization']);
        
        // Enforce cross-tenant isolation
        if (!$user->roles->contains('role_code', 'PLATFORM_ADMIN') && $user->organization) {
            $origin = $request->header('Origin') ?? $request->header('Referer') ?? '';
            $host = parse_url($origin, PHP_URL_HOST);
            if ($host) {
                $parts = explode('.', $host);
                $subdomain = strtolower($parts[0]);
                $expectedSubdomain = strtolower($user->organization->organization_code ?? $user->organization->uuid);
                if ($subdomain !== 'portal' && $subdomain !== 'localhost' && $subdomain !== $expectedSubdomain) {
                    throw ValidationException::withMessages([
                        'email' => ["Your account belongs to '{$user->organization->organization_name}'. You cannot access this workspace."],
                    ]);
                }
            }
        }

        // Verify the token using Password Broker
        if (!Password::broker()->tokenExists($user, $request->token)) {
            throw ValidationException::withMessages([
                'token' => ['This invitation token is invalid or has expired.'],
            ]);
        }

        // Token is valid. Update the user.
        $user->password = Hash::make($request->password);
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->status = 'ACTIVE';
        $user->save();

        // Delete the token so it can't be reused
        Password::broker()->deleteToken($user);

        // Auto-login the user by generating an access token
        $user->load(['userProfile', 'roles.permissions', 'organization']);
        $permissions = $user->roles->flatMap->permissions->pluck('permission_code')->unique()->values()->toArray();

        // Mock token string as used in login
        $accessToken = base64_encode(json_encode(['email' => $user->email, 'v' => $user->token_version]));

        return response()->json([
            'success' => true,
            'message' => 'Account claimed successfully',
            'access_token' => $accessToken,
            'user' => [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'organization_id' => $user->organization_id,
                'organization_name' => $user->organization ? $user->organization->organization_name : null,
                'roles' => $user->roles->pluck('role_code')->toArray(),
                'permissions' => $permissions
            ]
        ]);
    }
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if ($user) {
            $user->load(['roles', 'organization']);
            
            // Enforce cross-tenant isolation (silently fail to prevent enumeration)
            $isAuthorized = true;
            if (!$user->roles->contains('role_code', 'PLATFORM_ADMIN') && $user->organization) {
                $origin = $request->header('Origin') ?? $request->header('Referer') ?? '';
                $host = parse_url($origin, PHP_URL_HOST);
                if ($host) {
                    $parts = explode('.', $host);
                    $subdomain = strtolower($parts[0]);
                    $expectedSubdomain = strtolower($user->organization->organization_code ?? $user->organization->uuid);
                    if ($subdomain !== 'portal' && $subdomain !== 'localhost' && $subdomain !== $expectedSubdomain) {
                        $isAuthorized = false;
                    }
                }
            }

            if ($isAuthorized) {
                $token = Password::broker()->createToken($user);
                
                // Build the reset URL mapped to the tenant's domain
                $tenantId = 'portal';
                if ($user->organization) {
                    $tenantId = strtolower($user->organization->organization_code ?? $user->organization->uuid);
                }
                
                $resetUrl = "http://{$tenantId}.snapflect.localhost:4200/auth/reset-password?token={$token}&email=" . urlencode($user->email);
                
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\ResetPasswordMail($resetUrl));
            }
        }

        // Always return success to prevent email enumeration
        return response()->json([
            'success' => true,
            'message' => 'If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            throw ValidationException::withMessages(['email' => ['Invalid user.']]);
        }

        $user->load(['roles', 'organization']);
        
        // Enforce cross-tenant isolation
        if (!$user->roles->contains('role_code', 'PLATFORM_ADMIN') && $user->organization) {
            $origin = $request->header('Origin') ?? $request->header('Referer') ?? '';
            $host = parse_url($origin, PHP_URL_HOST);
            if ($host) {
                $parts = explode('.', $host);
                $subdomain = strtolower($parts[0]);
                $expectedSubdomain = strtolower($user->organization->organization_code ?? $user->organization->uuid);
                if ($subdomain !== 'portal' && $subdomain !== 'localhost' && $subdomain !== $expectedSubdomain) {
                    throw ValidationException::withMessages([
                        'email' => ["Your account belongs to '{$user->organization->organization_name}'. You cannot access this workspace."],
                    ]);
                }
            }
        }

        if (!Password::broker()->tokenExists($user, $request->token)) {
            throw ValidationException::withMessages(['token' => ['This password reset token is invalid or has expired.']]);
        }

        $user->password = Hash::make($request->password);
        
        // Invalidate current sessions by incrementing token version
        $user->token_version = $user->token_version + 1;
        $user->save();

        Password::broker()->deleteToken($user);

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully.'
        ]);
    }
}
