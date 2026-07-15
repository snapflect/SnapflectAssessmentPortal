<?php


namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * The root "/" route returns 404 in this API-only application.
     * This test verifies the app boots without error (no 500).
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        // API-only app has no root route; 404 is the expected response (not 500).
        $response->assertStatus(404);
    }
}
