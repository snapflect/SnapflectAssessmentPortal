<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Models;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Models\AssessmentSession;

class AssessmentSessionModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_has_uuid(): void
    {
        $traits = class_uses(AssessmentSession::class);
        $this->assertArrayHasKey(\App\Shared\Traits\HasUuid::class, $traits);
    }

    public function test_it_belongs_to_organization(): void
    {
        $traits = class_uses(AssessmentSession::class);
        $this->assertArrayHasKey(\App\Shared\Traits\BelongsToOrganization::class, $traits);
    }

    public function test_it_has_relations(): void
    {
        $model = new AssessmentSession();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->assessment());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->candidate());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $model->attempts());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $model->latestAttempt());
    }
}
