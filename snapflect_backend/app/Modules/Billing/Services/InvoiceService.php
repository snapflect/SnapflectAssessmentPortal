<?php

namespace App\Modules\Billing\Services;

use App\Modules\Billing\Models\TenantSubscription;
use App\Modules\Billing\Models\Invoice;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InvoiceService
{
    public function generateInvoiceForSubscription(TenantSubscription $subscription): Invoice
    {
        // Load the plan to get the price
        $plan = $subscription->plan;
        
        $invoiceNumber = 'INV-' . strtoupper(Str::random(8)) . '-' . date('Y');
        
        $status = ($plan->price == 0) ? 'PAID' : 'DRAFT';
        $paidDate = ($plan->price == 0) ? now() : null;
        
        $invoice = Invoice::create([
            'uuid' => Str::uuid(),
            'organization_id' => $subscription->organization_id,
            'tenant_subscription_id' => $subscription->id,
            'invoice_number' => $invoiceNumber,
            'amount_due' => $plan->price,
            'amount_paid' => ($status === 'PAID') ? $plan->price : 0,
            'status' => $status,
            'due_date' => now()->addDays(15), // Standard NET15
            'paid_date' => $paidDate,
            'payment_reference' => $subscription->reference_document,
            'created_by' => auth()->id() ?? 1,
            'created_date' => now(),
        ]);

        return $invoice;
    }

    public function markAsPaid(Invoice $invoice, string $paymentRef): void
    {
        $invoice->update([
            'status' => 'PAID',
            'amount_paid' => $invoice->amount_due,
            'paid_date' => now(),
            'payment_reference' => $paymentRef,
            'modified_date' => now(),
            'modified_by' => auth()->id() ?? 1,
        ]);
    }
}
