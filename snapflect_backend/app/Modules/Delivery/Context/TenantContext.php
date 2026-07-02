<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Context;

class TenantContext
{
    public function __construct(
        public readonly int $userId,
        public readonly int $organizationId
    ) {
    }
}
