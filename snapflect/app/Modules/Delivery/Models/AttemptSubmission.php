<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
App\Shared\Traits\HasUuid;\nApp\Shared\Traits\BelongsToOrganization;\nIlluminate\Database\Eloquent\Relations\BelongsTo;\nApp\Modules\Assessment\Models\AssessmentSnapshot;\nApp\Modules\Security\Models\User;

class AttemptSubmission extends Model
{
    use HasUuid, BelongsToOrganization;

    protected $table = 'attempt_submissions';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'created_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(AssessmentSnapshot::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_user_id');
    }
}
