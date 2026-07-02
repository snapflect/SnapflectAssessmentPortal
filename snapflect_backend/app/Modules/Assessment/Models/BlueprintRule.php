<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BlueprintRule extends Model
{
    use HasUuid;
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $fillable = [
        'uuid',
        'blueprint_section_id',
        'difficulty_level',
        'tag_id',
        'competency_id',
        'question_type',
        'question_count',
        'points_per_question',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'question_count' => 'integer',
        'points_per_question' => 'integer',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(BlueprintSection::class, 'blueprint_section_id');
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(QuestionTag::class, 'tag_id');
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class, 'competency_id');
    }
}
