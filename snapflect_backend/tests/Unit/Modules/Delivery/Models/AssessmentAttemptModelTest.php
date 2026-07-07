<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Models;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Models\AssessmentAttempt;

class AssessmentAttemptModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_has_uuid(): void
    {
        $traits = class_uses(AssessmentAttempt::class);
        $this->assertArrayHasKey(\App\Shared\Traits\HasUuid::class, $traits);
    }

    public function test_it_belongs_to_organization(): void
    {
        $traits = class_uses(AssessmentAttempt::class);
        $this->assertArrayHasKey(\App\Shared\Traits\BelongsToOrganization::class, $traits);
    }

    public function test_it_has_relations(): void
    {
        $model = new AssessmentAttempt();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->session());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->assessment());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->candidate());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $model->sections());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $model->questions());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $model->answers());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $model->submission());
    }

    public function test_it_casts_fields_correctly(): void
    {
        $model = new AssessmentAttempt();
        $casts = $model->getCasts();

        $this->assertArrayHasKey('is_deleted', $casts);
        $this->assertEquals('boolean', $casts['is_deleted']);
        $this->assertArrayHasKey('started_at', $casts);
        $this->assertEquals('datetime', $casts['started_at']);
        $this->assertArrayHasKey('completion_percentage', $casts);
        $this->assertEquals('decimal:2', $casts['completion_percentage']);
    }
}
