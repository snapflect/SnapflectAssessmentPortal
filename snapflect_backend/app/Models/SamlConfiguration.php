<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use App\Modules\Governance\Models\Organization;

class SamlConfiguration extends Model
{
    use HasFactory, CentralConnection;

    protected $fillable = [
        'organization_id',
        'idp_entity_id',
        'idp_sso_url',
        'idp_slo_url',
        'idp_x509_cert',
        'status',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }
}
