<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReportingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_basic_setup(): void
    {
        $this->assertTrue(true);
    }
}
