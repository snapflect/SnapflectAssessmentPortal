<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReportingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_assessment_report_returns_data(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create([
            'organization_id' => $org->id,
            'assessment_name' => 'Angular Developer Assessment'
        ]);
        
        $result = current((array) \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'result_status' => 'READY',
            'overall_percentage' => 85,
            'pass_fail_status' => 'PASS',
            'created_by' => 1,
            'created_date' => now()
        ]));

        $service = new \App\Modules\Results\Services\ReportingService();
        $filter = \App\Modules\Results\DTOs\ResultFilterDto::fromArray([]);
        $data = $service->assessmentReport($filter, $org->id, 1);
        $this->assertNotEmpty($data);
        $this->assertEquals('Angular Developer Assessment', $data[0]['assessment_name']);
    }

    public function test_competency_report_returns_data(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $competencyId = current((array) \Illuminate\Support\Facades\DB::table('competencies')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'competency_code' => 'COMP-1',
            'competency_name' => 'Frontend Architecture',
            'created_by' => 1,
            'created_date' => now()
        ]));

        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create([
            'organization_id' => $org->id
        ]);

        $resultId = current((array) \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]));

        \Illuminate\Support\Facades\DB::table('competency_scores')->insert([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'competency_id' => $competencyId,
            'competency_status' => 'PASS',
            'competency_percentage' => 90,
            'threshold_score' => 70,
            'created_by' => 1,
            'created_date' => now()
        ]);

        $service = new \App\Modules\Results\Services\ReportingService();
        $filter = \App\Modules\Results\DTOs\ResultFilterDto::fromArray([]);
        $data = $service->competencyReport($filter, $org->id, 1);
        $this->assertNotEmpty($data);
        $this->assertEquals('Frontend Architecture', $data[0]['competency_name']);
    }

    public function test_pass_fail_report_returns_data(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create([
            'organization_id' => $org->id,
            'assessment_name' => 'Angular Developer Assessment'
        ]);

        \Illuminate\Support\Facades\DB::table('assessment_results')->insert([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'pass_fail_status' => 'PASS',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $service = new \App\Modules\Results\Services\ReportingService();
        $filter = \App\Modules\Results\DTOs\ResultFilterDto::fromArray([]);
        $data = $service->passFailReport($filter, $org->id, 1);
        $this->assertNotEmpty($data);
        $this->assertEquals('Angular Developer Assessment', $data[0]['assessment_name']);
    }
}
