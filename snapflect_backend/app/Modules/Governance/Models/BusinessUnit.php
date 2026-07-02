<?php

declare(strict_types=1);

namespace App\Modules\Governance\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessUnit extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'business_units';

    protected $fillable = [
        'organization_id',
        'business_unit_code',
        'business_unit_name',
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

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class, 'business_unit_id', 'id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'business_unit_id', 'id');
    }
}
