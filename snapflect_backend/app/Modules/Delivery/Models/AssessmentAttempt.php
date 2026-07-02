<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Security\Models\User;

class AssessmentAttempt extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    protected $table = 'assessment_attempts';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'submitted_at' => 'datetime',
        'completion_percentage' => 'decimal:2',
    ];

    protected $hidden = [
        'id',
        'assessment_session_id',
        'assessment_id',
        'assessment_version_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AssessmentSession::class, 'assessment_session_id');
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function assessmentVersion(): BelongsTo
    {
        return $this->belongsTo(AssessmentVersion::class);
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(AssessmentSnapshot::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_user_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(AttemptSection::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AttemptQuestion::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CandidateAnswer::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(AttemptEvent::class);
    }

    public function audits(): HasMany
    {
        return $this->hasMany(AttemptAudit::class);
    }

    public function submission(): HasOne
    {
        return $this->hasOne(AttemptSubmission::class);
    }
}
