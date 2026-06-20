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

class Assessment extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;

    protected $fillable = [
        'uuid',
        'organization_id',
        'assessment_code',
        'assessment_name',
        'assessment_category_id',
        'assessment_type_id',
        'template_id',
        'current_state',
        'estimated_duration_minutes',
        'total_marks',
        'pass_percentage',
        'description',
        'is_published',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'estimated_duration_minutes' => 'integer',
        'total_marks' => 'decimal:2',
        'pass_percentage' => 'decimal:2',
        'is_published' => 'boolean',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssessmentCategory::class, 'assessment_category_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(AssessmentType::class, 'assessment_type_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(AssessmentTemplate::class, 'template_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(AssessmentVersion::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(AssessmentReview::class);
    }

    public function publications(): HasMany
    {
        return $this->hasMany(AssessmentPublication::class);
    }

    public function blueprint(): HasOne
    {
        return $this->hasOne(AssessmentBlueprint::class);
    }
}
