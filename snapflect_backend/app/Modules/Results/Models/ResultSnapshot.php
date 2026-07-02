<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;

class ResultSnapshot extends Model
{
    use HasUuid, BelongsToOrganization;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'result_snapshots';

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
        'result_version_id',
        'snapshot_hash',
        'snapshot_json',
        'rules_snapshot_json',
        'calculated_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'snapshot_json' => 'array',
        'rules_snapshot_json' => 'array',
        'calculated_at' => 'datetime',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function resultVersion(): BelongsTo
    {
        return $this->belongsTo(ResultVersion::class);
    }
}
