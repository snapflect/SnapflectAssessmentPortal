<?php

namespace App\Modules\Governance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Shared\Traits\HasUuid;

class OrganizationDraft extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'entity_type',
        'entity_id',
        'payload',
        'user_id'
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
