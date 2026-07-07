<?php

namespace App\Modules\Billing\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $table = 'subscription_plans';

    const CREATED_AT = 'created_date';
    const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'plan_code',
        'plan_name',
        'description',
        'price',
        'billing_interval',
        'interval_count',
        'included_assessments',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date',
    ];

    public function subscriptions()
    {
        return $this->hasMany(TenantSubscription::class, 'subscription_plan_id');
    }
}
