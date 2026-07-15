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
use App\Traits\ArchivesCodesOnDelete;

use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Organization extends Model
{
    use HasFactory, HasUuid, HasAuditFields, CentralConnection, ArchivesCodesOnDelete;

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
        'tenant_type',
        'phone_number',
        'it_escalation_email',
        'plan_code',
        'payment_reference',
        'primary_color',
        'theme_mode',
        'enforce_mfa',
        'enable_sso',
        'session_timeout',
        'logo_path',
        'pending_invites'
    ];

    protected $hidden = [
        'id',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'enforce_mfa' => 'boolean',
        'enable_sso' => 'boolean',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'pending_invites' => 'array',
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

    public function getCodeField(): string
    {
        return 'organization_code';
    }
}
