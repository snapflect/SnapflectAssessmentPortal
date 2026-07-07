<?php

namespace App\Modules\Billing\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Modules\Governance\Models\Organization;

class TenantSubscription extends Model
{
    use HasFactory;

    protected $table = 'tenant_subscriptions';

    const CREATED_AT = 'created_date';
    const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'subscription_plan_id',
        'status',
        'start_date',
        'end_date',
        'assessments_used',
        'reference_document',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'tenant_subscription_id');
    }
}
