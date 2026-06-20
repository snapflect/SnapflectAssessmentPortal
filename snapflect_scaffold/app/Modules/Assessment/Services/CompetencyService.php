<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use Illuminate\Support\Facades\DB;

class CompetencyService
{
    public function createCompetency()
    {
        return DB::transaction(function () { return true; });
    }
}
