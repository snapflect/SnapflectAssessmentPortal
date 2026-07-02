<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionTagMapping extends Pivot
{
    use HasUuid;

    public $incrementing = true;

    protected $fillable = [
        'uuid',
        'question_id',
        'tag_id',
        'created_by',
        'created_date'
    ];

    protected $casts = [

        'created_date' => 'datetime',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(QuestionTag::class, 'tag_id');
    }
}
