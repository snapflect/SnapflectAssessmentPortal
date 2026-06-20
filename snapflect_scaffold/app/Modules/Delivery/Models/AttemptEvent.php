<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
App\Shared\Traits\HasUuid;\nApp\Shared\Traits\BelongsToOrganization;\nIlluminate\Database\Eloquent\Relations\BelongsTo;

class AttemptEvent extends Model
{
    use HasUuid, BelongsToOrganization;

    protected $table = 'attempt_events';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $casts = [
        'event_timestamp' => 'datetime',
        'event_data_json' => 'array',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'created_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }
}
