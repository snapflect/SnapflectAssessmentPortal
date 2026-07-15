<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Shared\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Core\Traits\HasPlacementScope;

class QuestionBank extends Model
{
    use HasUuid;
    use BelongsToOrganization;
    use HasAuditFields;
    use HasPlacementScope;
    use \App\Traits\ArchivesCodesOnDelete;

    public function getCodeField(): string
    {
        return 'bank_code';
    }

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $fillable = [
        'uuid',
        'organization_id',
        'business_unit_id',
        'department_id',
        'bank_code',
        'bank_name',
        'is_system_bank',
        'description',
        'status',
        'created_by',
        'modified_by',
        'is_deleted',
        'deleted_by',
        'deleted_date'
    ];

    protected $casts = [
        'is_system_bank' => 'boolean',
        'is_deleted' => 'boolean',
        'deleted_date' => 'datetime',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
