<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Shared\Traits\HasAuditFields;

class SectionScore extends Model
{
    use HasUuid, BelongsToOrganization, HasAuditFields;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'section_scores';

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
        'assessment_section_id',
        'section_score',
        'section_percentage',
        'section_weight',
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
        'section_score' => 'decimal:2',
        'section_percentage' => 'decimal:2',
        'section_weight' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Assessment\Models\BlueprintSection::class, 'assessment_section_id');
    }
}
