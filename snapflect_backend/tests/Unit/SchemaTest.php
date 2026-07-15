<?php
namespace Tests\Unit;
use Tests\TenancyTestCase;
use Illuminate\Support\Facades\Schema;
class SchemaTest extends TenancyTestCase {
    public function test_schema() {
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('question_banks'));
    }
}
