<?php

namespace App\Modules\Support\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Modules\Security\Models\User;
use App\Modules\Governance\Models\Organization;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'organization_id',
        'user_id',
        'subject',
        'description',
        'status',
        'priority',
        'assigned_to'
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function replies()
    {
        return $this->hasMany(SupportTicketReply::class, 'ticket_id');
    }
}
