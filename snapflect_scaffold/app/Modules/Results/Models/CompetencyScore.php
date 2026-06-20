<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;\nuse Illuminate\Database\Eloquent\Relations\BelongsTo;\nuse Illuminate\Database\Eloquent\Relations\HasMany;\nuse App\Shared\Traits\HasUuid;\nuse App\Shared\Traits\BelongsToOrganization;\nuse App\Shared\Traits\HasAuditFields;

class CompetencyScore extends Model
{
    use HasUuid, BelongsToOrganization, HasAuditFields;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'competency_scores';

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
        'assessment_result_id',
        'competency_id',
        'competency_score',
        'competency_percentage',
        'threshold_score',
        'competency_status',
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
        'competency_score' => 'decimal:2',
        'competency_percentage' => 'decimal:2',
        'threshold_score' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Assessment\Models\Competency::class);
    }
}
