<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Shared\Traits\HasAuditFields;
use App\Traits\ArchivesCodesOnDelete;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AssessmentTemplate extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;
    use ArchivesCodesOnDelete;

    public function getCodeField(): string
    {
        return 'template_code';
    }

    protected $fillable = [
        'uuid',
        'organization_id',
        'template_code',
        'template_name',
        'assessment_category_id',
        'assessment_type_id',
        'description',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [

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

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class, 'template_id');
    }
}
