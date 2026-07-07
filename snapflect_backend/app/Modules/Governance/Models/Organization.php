<?php

declare(strict_types=1);

namespace App\Modules\Governance\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Modules\Billing\Models\TenantSubscription;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Organization extends Model
{
    use HasFactory, HasUuid, HasAuditFields;

    protected static function newFactory()
    {
        return \Database\Factories\OrganizationFactory::new();
    }

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'organizations';

    protected $fillable = [
        'organization_code',
        'organization_name',
        'legal_name',
        'contact_email',
        'country',
        'timezone',
        'status',
        'is_deleted',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $hidden = [
        'id',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function businessUnits(): HasMany
    {
        return $this->hasMany(BusinessUnit::class, 'organization_id', 'id');
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class, 'organization_id', 'id');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'organization_id', 'id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'organization_id', 'id');
    }

    public function currentSubscription(): HasOne
    {
        return $this->hasOne(TenantSubscription::class, 'organization_id', 'id')
                    ->whereIn('status', ['ACTIVE', 'TRIALING', 'PAST_DUE'])
                    ->latestOfMany('created_date');
    }
}
