<?php

declare(strict_types=1);

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Modules\Governance\Models\BusinessUnit;
use App\Modules\Governance\Models\Department;
use App\Modules\Governance\Models\Location;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasUuid, HasAuditFields, BelongsToOrganization, Notifiable;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'users';

    protected $fillable = [
        'organization_id',
        'business_unit_id',
        'department_id',
        'location_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'status',
        'last_login_at',
        'is_deleted',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $hidden = [
        'password',
        'id',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'is_deleted' => 'boolean',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function businessUnit(): BelongsTo
    {
        return $this->belongsTo(BusinessUnit::class, 'business_unit_id', 'id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }

    public function userProfile(): HasOne
    {
        return $this->hasOne(UserProfile::class, 'user_id', 'id');
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class, 'user_id', 'id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    public function hasRole($roles): bool
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }
        return $this->roles()
            ->whereIn('role_name', $roles)
            ->orWhereIn('role_code', $roles)
            ->exists();
    }

    public function hasPermission(string $permissionCode): bool
    {
        // System roles or super admins might have a bypass, but let's stick to explicit permissions.
        return $this->roles()->whereHas('permissions', function ($query) use ($permissionCode) {
            $query->where('permission_code', $permissionCode);
        })->exists();
    }
}
