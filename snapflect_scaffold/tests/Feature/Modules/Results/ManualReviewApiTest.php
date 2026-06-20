<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ManualReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_negative_score_rejected(): void
    {
        $this->markTestIncomplete('Test scaffolded for Sprint 4 phase 11.');
    }
}
