<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_cross_tenant_access_denied(): void
    {
        $this->markTestIncomplete('Test scaffolded for Sprint 4 phase 11.');
    }\n
    public function test_cross_tenant_publication_denied(): void
    {
        $this->markTestIncomplete('Test scaffolded for Sprint 4 phase 11.');
    }
}
