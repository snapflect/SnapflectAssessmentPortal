<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Requests;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Requests\CreateBlueprintRequest;

class BlueprintRequestTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_nested_blueprint_validation()
    {
        $request = new CreateBlueprintRequest();
        $rules = $request->rules();

        $this->assertArrayHasKey('sections', $rules);
        $this->assertArrayHasKey('sections.*.section_name', $rules);
        $this->assertArrayHasKey('sections.*.rules.*.question_count', $rules);
        $this->assertArrayHasKey('sections.*.questions.*.question_uuid', $rules);
        
        $this->assertContains('required', $rules['sections']);
        $this->assertContains('required', $rules['sections.*.section_name']);
    }

    public function test_uuid_validation()
    {
        $request = new CreateBlueprintRequest();
        $rules = $request->rules();

        $this->assertContains('uuid', $rules['assessment_uuid']);
        $this->assertContains('uuid', $rules['sections.*.rules.*.tag_uuid']);
        $this->assertContains('uuid', $rules['sections.*.rules.*.competency_uuid']);
        $this->assertContains('uuid', $rules['sections.*.questions.*.question_uuid']);
    }
}
