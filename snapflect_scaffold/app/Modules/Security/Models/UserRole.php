<?php

declare(strict_types=1);

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasUuid;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $table = 'user_roles';

    protected $fillable = [
        'user_id',
        'role_id',
        'created_by',
    ];

    protected $hidden = [
        'id',
    ];

    protected $casts = [
        'created_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }
}
