<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Shared\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CompetencyGroup extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'group_code',
        'group_name',
        'description',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [

        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function competencies(): HasMany
    {
        return $this->hasMany(Competency::class);
    }
}
