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

class BlueprintSection extends Model
{
    use HasUuid;
    use HasAuditFields;

    protected $fillable = [
        'uuid',
        'blueprint_id',
        'section_name',
        'display_order',
        'section_duration_minutes',
        'section_weight',
        'selection_strategy',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'display_order' => 'integer',
        'section_duration_minutes' => 'integer',
        'section_weight' => 'decimal:2',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function blueprint(): BelongsTo
    {
        return $this->belongsTo(AssessmentBlueprint::class, 'blueprint_id');
    }

    public function rules(): HasMany
    {
        return $this->hasMany(BlueprintRule::class);
    }

    public function sectionQuestions(): HasMany
    {
        return $this->hasMany(BlueprintSectionQuestion::class);
    }
}
