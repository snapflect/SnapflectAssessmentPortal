<?php

declare(strict_types=1);

namespace App\Modules\Results\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Certificate extends Model
{
    protected $table = 'certificates';
    
    const CREATED_AT = 'created_date';
    const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'assessment_result_id',
        'verification_code',
        'status',
        'issued_at',
        'storage_path',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'issued_at' => 'datetime',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }
}
