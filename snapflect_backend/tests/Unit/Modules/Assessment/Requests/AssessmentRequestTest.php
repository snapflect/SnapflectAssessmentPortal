<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Requests;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Requests\CreateAssessmentRequest;

class AssessmentRequestTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup mock data, factories, and user roles
    }

    public function test_uuid_validation()
    {
        $request = new CreateAssessmentRequest();
        $rules = $request->rules();

        $this->assertContains('uuid', $rules['assessment_category_uuid']);
        $this->assertContains('uuid', $rules['assessment_type_uuid']);
        $this->assertContains('uuid', $rules['template_uuid']);
    }

    public function test_required_fields()
    {
        $request = new CreateAssessmentRequest();
        $rules = $request->rules();

        $this->assertContains('required', $rules['assessment_code']);
        $this->assertContains('required', $rules['assessment_name']);
        $this->assertContains('required', $rules['assessment_category_uuid']);
        $this->assertContains('required', $rules['assessment_type_uuid']);
    }
}
