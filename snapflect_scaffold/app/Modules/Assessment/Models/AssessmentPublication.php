<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use App\Shared\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AssessmentPublication extends Model
{
    use HasUuid;
    use HasAuditFields;

    protected $fillable = [
        'uuid',
        'assessment_id',
        'assessment_version_id',
        'assessment_snapshot_id',
        'published_by',
        'published_date',
        'publication_notes',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'published_date' => 'datetime',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(AssessmentVersion::class, 'assessment_version_id');
    }

    public function snapshot(): BelongsTo
    {
        return $this->belongsTo(AssessmentSnapshot::class, 'assessment_snapshot_id');
    }
}
