<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;

class ResultAudit extends Model
{
    use HasUuid, BelongsToOrganization;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'result_audits';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'organization_id',
        'assessment_result_id',
        'audit_type',
        'audit_description',
        'old_value_json',
        'new_value_json',
        'performed_by',
        'performed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_value_json' => 'array',
        'new_value_json' => 'array',
        'performed_at' => 'datetime',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Security\Models\User::class, 'performed_by');
    }
}
