<?php

declare(strict_types=1);

namespace App\Modules\Governance\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Governance\Services\OrganizationService;
use App\Modules\Governance\Requests\CreateOrganizationRequest;
use App\Modules\Governance\Requests\UpdateOrganizationRequest;
use App\Modules\Governance\Resources\OrganizationResource;
use App\Modules\Governance\Models\Organization;

class OrganizationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly OrganizationService $organizationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Organization::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        if ($request->user()->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            $organizations = $this->organizationService->paginate($perPage);
            $organizations->load('currentSubscription.plan');
        } else {
            // For CLIENT_ADMIN, only return their own organization.
            $organization = $this->organizationService->findByUuid($request->user()->organization->uuid ?? '');
            $organization->load('currentSubscription.plan');
            // Wrap it in a LengthAwarePaginator to match the paginate return type
            $organizations = new \Illuminate\Pagination\LengthAwarePaginator([$organization], 1, $perPage, 1);
        }

        return response()->json(
            OrganizationResource::collection($organizations)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('view', $organization);
        
        $organization->load('currentSubscription.plan');

        return response()->json(
            (new OrganizationResource($organization))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateOrganizationRequest $request): JsonResponse
    {
        $this->authorize('create', Organization::class);

        $organization = $this->organizationService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new OrganizationResource($organization))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateOrganizationRequest $request, string $uuid): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('update', $organization);

        $this->organizationService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedOrganization = $this->organizationService->findByUuid($uuid);

        return response()->json(
            (new OrganizationResource($updatedOrganization))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('delete', $organization);

        $this->organizationService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }

    public function billing(string $uuid, Request $request): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('view', $organization);

        $subscription = \App\Modules\Billing\Models\TenantSubscription::with('plan')
            ->where('organization_id', $organization->id)
            ->whereIn('status', ['ACTIVE', 'TRIALING', 'PAST_DUE'])
            ->orderBy('created_date', 'desc')
            ->first();

        $invoices = \App\Modules\Billing\Models\Invoice::where('organization_id', $organization->id)
            ->orderBy('created_date', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'subscription' => $subscription,
                'invoices' => $invoices
            ],
            'success' => true
        ]);
    }

    public function inviteAdmin(string $uuid, Request $request): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('update', $organization);

        $email = $organization->contact_email;
        if (!$email) {
            return response()->json(['success' => false, 'message' => 'Organization has no contact email.'], 400);
        }

        // Find or create the user
        $user = \App\Modules\Security\Models\User::firstOrCreate(
            ['email' => $email],
            [
                'organization_id' => $organization->id,
                'first_name' => 'Client',
                'last_name' => 'Admin',
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
                'status' => 'ACTIVE'
            ]
        );

        // Generate a password reset token
        $token = \Illuminate\Support\Facades\Password::broker()->createToken($user);
        
        // Build the claim URL
        $tenantId = strtolower($organization->organization_code ?? $organization->uuid);
        $claimUrl = "http://{$tenantId}.snapflect.localhost:4200/claim-account?token={$token}&email=" . urlencode($email);

        // Send the custom invite email
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\AdminInviteMail($claimUrl, $organization->organization_name));

        return response()->json([
            'success' => true,
            'message' => 'Admin invite sent successfully'
        ]);
    }

    public function updateSmtp(string $uuid, Request $request): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'smtp_host' => 'required|string',
            'smtp_port' => 'required|integer',
            'smtp_username' => 'required|string',
            'smtp_password' => 'required|string',
            'smtp_encryption' => 'nullable|string',
            'smtp_from_address' => 'required|email',
            'smtp_from_name' => 'required|string',
        ]);

        $tenantId = strtolower($organization->organization_code ?? $organization->uuid);
        $tenant = \App\Models\Tenant::find($tenantId);

        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found.'], 404);
        }

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'SMTP settings updated successfully'
        ]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('logos', $filename, 'public');
            
            $logoUrl = \Illuminate\Support\Facades\Storage::url($path);
            
            return response()->json([
                'success' => true,
                'data' => ['logo_path' => $logoUrl],
                'message' => 'Logo uploaded successfully'
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No file uploaded'], 400);
    }
}
