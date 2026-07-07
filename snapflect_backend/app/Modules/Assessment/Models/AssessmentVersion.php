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

class AssessmentVersion extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'assessment_id',
        'major_version',
        'minor_version',
        'version_label',
        'change_summary',
        'parent_version_id',
        'published_date',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'major_version' => 'integer',
        'minor_version' => 'integer',
        'published_date' => 'datetime',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function parentVersion(): BelongsTo
    {
        return $this->belongsTo(AssessmentVersion::class, 'parent_version_id');
    }

    public function childVersions(): HasMany
    {
        return $this->hasMany(AssessmentVersion::class, 'parent_version_id');
    }
}
