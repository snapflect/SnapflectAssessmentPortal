<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
App\Shared\Traits\HasUuid;\nApp\Shared\Traits\HasAuditFields;\nApp\Shared\Traits\BelongsToOrganization;\nIlluminate\Database\Eloquent\Relations\BelongsTo;\nIlluminate\Database\Eloquent\Relations\HasMany;

class AttemptSection extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    protected $table = 'attempt_sections';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'blueprint_section_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AttemptQuestion::class);
    }
}
