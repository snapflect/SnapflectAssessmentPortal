<?php

namespace App\Http\Controllers;

use App\Models\SamlConfiguration;
use App\Modules\Governance\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SamlController extends Controller
{
    /**
     * Update SAML Configuration for an Organization
     */
    public function update(Request $request, string $organizationUuid): JsonResponse
    {
        $organization = Organization::where('uuid', $organizationUuid)->firstOrFail();

        $validated = $request->validate([
            'idp_entity_id' => 'required|string',
            'idp_sso_url' => 'required|url',
            'idp_slo_url' => 'nullable|url',
            'idp_x509_cert' => 'required|string',
            'status' => 'nullable|string|in:ACTIVE,INACTIVE'
        ]);

        $samlConfig = SamlConfiguration::updateOrCreate(
            ['organization_id' => $organization->id],
            $validated
        );

        return response()->json([
            'message' => 'SAML configuration updated successfully',
            'data' => $samlConfig
        ]);
    }

    /**
     * Get SAML Configuration for an Organization
     */
    public function show(string $organizationUuid): JsonResponse
    {
        $organization = Organization::where('uuid', $organizationUuid)->firstOrFail();
        $samlConfig = SamlConfiguration::where('organization_id', $organization->id)->first();

        if (!$samlConfig) {
            return response()->json(['message' => 'SAML configuration not found'], 404);
        }

        return response()->json(['data' => $samlConfig]);
    }

    /**
     * Assertion Consumer Service (ACS)
     * Receives the SAML Response from the IdP
     */
    public function acs(Request $request, string $organizationUuid)
    {
        $organization = Organization::where('uuid', $organizationUuid)->firstOrFail();
        
        // In a real implementation, we would use a SAML toolkit (e.g., OneLogin PHP Toolkit)
        // to parse and validate the base64 encoded $request->input('SAMLResponse')
        // For demonstration purposes, we assume validation passes and we extract the NameID (email).
        
        $email = $request->input('email'); // Simulated extraction from SAMLResponse
        if (!$email) {
            return response()->json(['message' => 'Invalid SAML Response: Missing email'], 400);
        }

        // Find or create the user in the Central DB (JIT Provisioning)
        $user = \App\Modules\Security\Models\User::firstOrCreate(
            ['email' => $email],
            [
                'organization_id' => $organization->id,
                'first_name' => $request->input('first_name', 'SSO'),
                'last_name' => $request->input('last_name', 'User'),
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
                'status' => 'ACTIVE'
            ]
        );

        // Generate Sanctum authentication token
        $token = $user->createToken('sso-token')->plainTextToken;

        // Redirect to Frontend with token
        $tenantId = strtolower($organization->organization_code ?? $organization->uuid);
        $frontendUrl = "http://{$tenantId}.snapflect.localhost:4200/auth/sso-callback?token={$token}";

        return redirect()->away($frontendUrl);
    }
}
