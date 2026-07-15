<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Shared\Traits\HasAuditFields;
use App\Traits\ArchivesCodesOnDelete;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AssessmentCategory extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasAuditFields, ArchivesCodesOnDelete;

    public function getCodeField(): string
    {
        return 'category_code';
    }

    protected static function newFactory()
    {
        return \Database\Factories\AssessmentCategoryFactory::new();
    }

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'category_code',
        'category_name',
        'description',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [

        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }
}
