<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttemptAudit extends Model
{
    use HasUuid, BelongsToOrganization;

    protected $table = 'attempt_audits';

    public $timestamps = false;

    protected $casts = [
        'changed_at' => 'datetime',
        'old_value_json' => 'array',
        'new_value_json' => 'array',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'changed_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }
}
