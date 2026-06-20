<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionCompetency extends Pivot
{
    use HasUuid;

    public $incrementing = true;

    protected $fillable = [
        'uuid',
        'question_id',
        'competency_id',
        'weight_percentage',
        'created_by',
        'created_date'
    ];

    protected $casts = [
        'weight_percentage' => 'decimal:2',
        'created_date' => 'datetime',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }
}
