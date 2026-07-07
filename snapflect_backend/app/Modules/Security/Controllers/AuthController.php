<?php

namespace App\Modules\Security\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Modules\Security\Models\User;
use Illuminate\Validation\ValidationException;

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

        // Get user profile, roles, and organization to include in response
        $user->load(['userProfile', 'roles.permissions', 'organization']);
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
}
