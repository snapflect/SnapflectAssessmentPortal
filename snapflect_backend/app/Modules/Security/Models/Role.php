<?php

declare(strict_types=1);

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Modules\Governance\Models\Organization;
use App\Traits\ArchivesCodesOnDelete;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory, HasUuid, HasAuditFields, ArchivesCodesOnDelete;

    public function getCodeField(): string
    {
        return 'role_code';
    }

    protected static function newFactory()
    {
        return \Database\Factories\RoleFactory::new();
    }

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'roles';

    protected $fillable = [
        'organization_id',
        'role_code',
        'role_name',
        'description',
        'is_system_role',
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
        'is_system_role' => 'boolean',
        'is_deleted' => 'boolean',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class, 'role_id', 'id');
    }

    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'role_id', 'id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id');
    }
}
