<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Shared\Traits\HasAuditFields;

class ResultPublication extends Model
{
    use HasUuid, BelongsToOrganization, HasAuditFields;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'result_publications';

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
        'publication_status',
        'published_by',
        'published_at',
        'archived_by',
        'archived_at',
        'publication_notes',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'published_at' => 'datetime',
        'archived_at' => 'datetime',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Security\Models\User::class, 'published_by');
    }
}
