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

class Question extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;

    protected $fillable = [
        'uuid',
        'organization_id',
        'question_bank_id',
        'question_code',
        'question_type',
        'difficulty_level',
        'question_text',
        'explanation',
        'max_score',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'max_score' => 'decimal:2',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'question_bank_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function competencies(): BelongsToMany
    {
        return $this->belongsToMany(Competency::class, 'question_competencies')->withPivot('weight_percentage');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(QuestionTag::class, 'question_tag_mappings');
    }
}
