<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Models;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Models\CandidateAnswer;

class CandidateAnswerModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_has_uuid(): void
    {
        $traits = class_uses(CandidateAnswer::class);
        $this->assertArrayHasKey(\App\Shared\Traits\HasUuid::class, $traits);
    }

    public function test_it_belongs_to_organization(): void
    {
        $traits = class_uses(CandidateAnswer::class);
        $this->assertArrayHasKey(\App\Shared\Traits\BelongsToOrganization::class, $traits);
    }

    public function test_it_has_relations(): void
    {
        $model = new CandidateAnswer();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->attempt());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $model->question());
    }

    public function test_it_casts_json_fields_correctly(): void
    {
        $model = new CandidateAnswer();
        $casts = $model->getCasts();

        $this->assertArrayHasKey('selected_option_uuids_json', $casts);
        $this->assertEquals('array', $casts['selected_option_uuids_json']);
        
        $this->assertArrayHasKey('answer_json', $casts);
        $this->assertEquals('array', $casts['answer_json']);

        $this->assertArrayHasKey('is_final_answer', $casts);
        $this->assertEquals('boolean', $casts['is_final_answer']);
    }
}
