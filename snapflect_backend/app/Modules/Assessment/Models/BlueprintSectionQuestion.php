<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlueprintSectionQuestion extends Pivot
{
    use HasUuid;

    protected $table = 'blueprint_section_questions';

    public $incrementing = true;

    protected $fillable = [
        'uuid',
        'blueprint_section_id',
        'question_id',
        'display_order',
        'created_by',
        'created_date'
    ];

    protected $casts = [
        'display_order' => 'integer',
        'created_date' => 'datetime',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(BlueprintSection::class, 'blueprint_section_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
