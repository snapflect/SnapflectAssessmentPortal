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

class Competency extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'competency_group_id',
        'competency_code',
        'competency_name',
        'proficiency_level',
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

    public function group(): BelongsTo
    {
        return $this->belongsTo(CompetencyGroup::class, 'competency_group_id');
    }
}
