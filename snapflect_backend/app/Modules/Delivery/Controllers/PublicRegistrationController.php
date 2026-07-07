<?php

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Security\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PublicRegistrationController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'publication_code' => 'required|string'
        ]);

        $publicationCode = strtoupper(trim($request->input('publication_code')));
        $publication = DB::table('assessment_publications')->where('publication_code', $publicationCode)->first();

        if (!$publication) {
            return response()->json(['success' => false, 'message' => 'Invalid publication code.'], 404);
        }

        if ($publication->status !== 'SCHEDULED' && $publication->status !== 'PUBLISHED') {
            return response()->json(['success' => false, 'message' => 'This assessment is not open for registration.'], 400);
        }

        $email = strtolower(trim($request->input('email')));
        $user = User::where('email', $email)->first();

        DB::beginTransaction();
        try {
            if (!$user) {
                $candidateRole = DB::table('roles')->where('role_code', 'CANDIDATE')->first();
                $roleId = $candidateRole ? $candidateRole->id : 5;
                
                // Get organization from publication's assessment
                $assessment = DB::table('assessments')->where('id', $publication->assessment_id)->first();
                
                $user = User::create([
                    'email' => $email,
                    'first_name' => $request->input('first_name'),
                    'last_name' => $request->input('last_name'),
                    'password' => Hash::make(Str::random(12)),
                    'organization_id' => $assessment ? $assessment->organization_id : 1
                ]);

                DB::table('user_roles')->insert([
                    'uuid' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'role_id' => $roleId,
                    'created_by' => $user->id,
                    'created_date' => Carbon::now()
                ]);
            } else {
                // If the user already exists, update their first name and last name to match the registration form
                $user->update([
                    'first_name' => $request->input('first_name'),
                    'last_name' => $request->input('last_name')
                ]);

                // Ensure they have the CANDIDATE role
                $candidateRole = DB::table('roles')->where('role_code', 'CANDIDATE')->first();
                $roleId = $candidateRole ? $candidateRole->id : 5;
                
                $hasRole = DB::table('user_roles')->where('user_id', $user->id)->where('role_id', $roleId)->exists();
                if (!$hasRole) {
                    DB::table('user_roles')->insert([
                        'uuid' => (string) Str::uuid(),
                        'user_id' => $user->id,
                        'role_id' => $roleId,
                        'created_by' => $user->id,
                        'created_date' => Carbon::now()
                    ]);
                }
            }

            // Check if already assigned
            $existing = DB::table('publication_candidates')
                ->where('publication_id', $publication->id)
                ->where('candidate_id', $user->id)
                ->first();

            if (!$existing) {
                DB::table('publication_candidates')->insert([
                    'uuid' => (string) Str::uuid(),
                    'publication_id' => $publication->id,
                    'candidate_id' => $user->id,
                    'status' => 'ASSIGNED',
                    'created_by' => $user->id,
                    'created_date' => Carbon::now()
                ]);
            }

            DB::commit();

            $token = base64_encode(json_encode(['email' => $user->email]));

            // Fetch user with roles and organization for a proper session profile
            $user->load(['roles.permissions', 'organization']);
            $permissions = $user->roles->flatMap->permissions->pluck('permission_code')->unique()->values()->toArray();

            // Auto-login the user or just return success
            return response()->json([
                'success' => true,
                'message' => 'Registration successful.',
                'token' => $token,
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
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }
}
