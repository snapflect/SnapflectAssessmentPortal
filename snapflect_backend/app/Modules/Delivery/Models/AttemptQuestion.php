<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttemptQuestion extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    protected $table = 'attempt_questions';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'is_flagged' => 'boolean',
        'viewed_at' => 'datetime',
        'answered_at' => 'datetime',
        'max_score' => 'decimal:2',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'attempt_section_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(AttemptSection::class, 'attempt_section_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CandidateAnswer::class);
    }
}
