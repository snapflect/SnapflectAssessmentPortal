<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Models;

use Illuminate\Database\Eloquent\Model;
App\Shared\Traits\HasUuid;\nApp\Shared\Traits\HasAuditFields;\nApp\Shared\Traits\BelongsToOrganization;\nIlluminate\Database\Eloquent\Relations\BelongsTo;

class CandidateAnswer extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    protected $table = 'candidate_answers';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'is_final_answer' => 'boolean',
        'saved_at' => 'datetime',
        'numeric_answer' => 'decimal:4',
        'selected_option_uuids_json' => 'array',
        'answer_json' => 'array',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'attempt_question_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(AttemptQuestion::class, 'attempt_question_id');
    }
}
