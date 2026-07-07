<?php

namespace App\Modules\Billing\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Billing\Models\TenantSubscription;
use App\Modules\Billing\Models\Invoice;
use App\Modules\Governance\Models\Organization;
use App\Modules\Billing\Services\InvoiceGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BillingController extends Controller
{
    /**
     * Get the current active subscription for the tenant.
     */
    public function currentSubscription(Request $request): JsonResponse
    {
        // Assuming MockAuthMiddleware injects user with organization_id
        $orgId = $request->user()->organization_id;

        $subscription = TenantSubscription::with('plan')
            ->where('organization_id', $orgId)
            ->whereIn('status', ['ACTIVE', 'TRIALING', 'PAST_DUE'])
            ->orderBy('created_date', 'desc')
            ->first();

        if (!$subscription) {
            return response()->json([
                'data' => null,
                'message' => 'No active subscription found for this organization.'
            ], 200);
        }

        return response()->json([
            'data' => $subscription
        ]);
    }

    /**
     * Get all invoices for the tenant.
     */
    public function invoices(Request $request): JsonResponse
    {
        $orgId = $request->user()->organization_id;

        $invoices = Invoice::where('organization_id', $orgId)
            ->orderBy('created_date', 'desc')
            ->get();

        return response()->json([
            'data' => $invoices
        ]);
    }

    /**
     * Get available subscription plans.
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::where('status', 'ACTIVE')
            ->orderBy('price', 'asc')
            ->get();

        return response()->json([
            'data' => $plans
        ]);
    }

    /**
     * Download the invoice PDF.
     */
    public function download(Request $request, string $uuid)
    {
        $orgId = $request->user()->organization_id;

        $invoice = Invoice::where('uuid', $uuid)->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        if ($invoice->organization_id !== $orgId) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $service = app(InvoiceGenerationService::class);
        $pdfBytes = $service->generatePdfBytes($invoice);

        return response()->streamDownload(function () use ($pdfBytes) {
            echo $pdfBytes;
        }, $invoice->invoice_number . '.pdf', [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Get all clients with their current active subscriptions (Platform Admin only).
     */
    public function platformClients(Request $request): JsonResponse
    {
        $organizations = Organization::with('currentSubscription.plan')
            ->where('is_deleted', false)
            ->where('id', '!=', 1) // Exclude the platform itself (Organization ID 1)
            ->get();

        return response()->json([
            'data' => $organizations
        ]);
    }

    /**
     * Get all invoices across all tenants (Platform Admin only).
     */
    public function platformInvoices(Request $request): JsonResponse
    {
        $invoices = Invoice::join('organizations', 'invoices.organization_id', '=', 'organizations.id')
            ->where('invoices.organization_id', '!=', 1) // Exclude platform invoices
            ->select('invoices.*', 'organizations.organization_name')
            ->orderBy('invoices.created_date', 'desc')
            ->get();

        return response()->json([
            'data' => $invoices
        ]);
    }
}
