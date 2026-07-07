<?php

namespace App\Modules\Billing\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Modules\Governance\Models\Organization;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoices';

    const CREATED_AT = 'created_date';
    const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'tenant_subscription_id',
        'invoice_number',
        'amount_due',
        'amount_paid',
        'status',
        'due_date',
        'paid_date',
        'payment_reference',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'paid_date' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    public function subscription()
    {
        return $this->belongsTo(TenantSubscription::class, 'tenant_subscription_id');
    }
}
