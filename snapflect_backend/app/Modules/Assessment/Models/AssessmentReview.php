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

class AssessmentReview extends Model
{
    use HasUuid;
    use HasAuditFields;

    protected $fillable = [
        'uuid',
        'assessment_id',
        'review_status',
        'review_comments',
        'reviewed_by',
        'reviewed_date',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'reviewed_date' => 'datetime',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }
}
