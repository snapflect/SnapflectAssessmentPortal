<?php

declare(strict_types=1);

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasUuid;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $table = 'role_permissions';

    protected $fillable = [
        'role_id',
        'permission_id',
        'created_by',
    ];

    protected $hidden = [
        'id',
    ];

    protected $casts = [
        'created_date' => 'datetime',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class, 'permission_id', 'id');
    }
}
