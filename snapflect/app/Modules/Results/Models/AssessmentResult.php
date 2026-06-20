<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;\nuse Illuminate\Database\Eloquent\Relations\BelongsTo;\nuse Illuminate\Database\Eloquent\Relations\HasMany;\nuse App\Shared\Traits\HasUuid;\nuse App\Shared\Traits\BelongsToOrganization;\nuse App\Shared\Traits\HasAuditFields;

class AssessmentResult extends Model
{
    use HasUuid, BelongsToOrganization, HasAuditFields;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'assessment_results';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'organization_id',
        'assessment_id',
        'assessment_version_id',
        'assessment_snapshot_id',
        'assessment_attempt_id',
        'candidate_user_id',
        'result_reference',
        'result_version',
        'overall_score',
        'overall_percentage',
        'pass_fail_status',
        'result_status',
        'calculated_at',
        'published_at',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'calculated_at' => 'datetime',
        'published_at' => 'datetime',
        'overall_score' => 'decimal:2',
        'overall_percentage' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Security\Models\Organization::class);
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Assessment\Models\Assessment::class);
    }

    public function assessmentVersion(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Assessment\Models\AssessmentVersion::class);
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Assessment\Models\AssessmentSnapshot::class);
    }

    public function assessmentAttempt(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Delivery\Models\AssessmentAttempt::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Security\Models\User::class, 'candidate_user_id');
    }

    public function resultVersions(): HasMany
    {
        return $this->hasMany(ResultVersion::class);
    }

    public function questionScores(): HasMany
    {
        return $this->hasMany(QuestionScore::class);
    }

    public function sectionScores(): HasMany
    {
        return $this->hasMany(SectionScore::class);
    }

    public function competencyScores(): HasMany
    {
        return $this->hasMany(CompetencyScore::class);
    }

    public function resultRules(): HasMany
    {
        return $this->hasMany(ResultRule::class);
    }

    public function resultPublications(): HasMany
    {
        return $this->hasMany(ResultPublication::class);
    }

    public function resultAudits(): HasMany
    {
        return $this->hasMany(ResultAudit::class);
    }

    public function resultSnapshots(): HasMany
    {
        return $this->hasMany(ResultSnapshot::class);
    }

    public function manualScoreReviews(): HasMany
    {
        return $this->hasMany(ManualScoreReview::class);
    }
}
