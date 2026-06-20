<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentCompetency extends Pivot
{
    use HasUuid;

    public $incrementing = true;

    protected $fillable = [
        'uuid',
        'assessment_id',
        'competency_id',
        'target_percentage',
        'created_by',
        'created_date'
    ];

    protected $casts = [
        'target_percentage' => 'decimal:2',
        'created_date' => 'datetime',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }
}
