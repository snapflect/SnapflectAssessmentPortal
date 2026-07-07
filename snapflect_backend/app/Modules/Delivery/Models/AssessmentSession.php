<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Security\Models\User;

class AssessmentSession extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    protected $table = 'assessment_sessions';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'access_started_at' => 'datetime',
        'access_expires_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    protected $hidden = [
        'id',
        'assessment_id',
        'assessment_version_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

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

    public function attempts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AssessmentAttempt::class, 'assessment_session_id');
    }

    public function latestAttempt(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(AssessmentAttempt::class, 'assessment_session_id')->latest('id');
    }
}
