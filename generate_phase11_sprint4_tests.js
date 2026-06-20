const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'tests');
const unitDir = path.join(baseDir, 'Unit', 'Modules', 'Results');
const featureDir = path.join(baseDir, 'Feature', 'Modules', 'Results');

if (!fs.existsSync(unitDir)) fs.mkdirSync(unitDir, { recursive: true });
if (!fs.existsSync(featureDir)) fs.mkdirSync(featureDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const unitTests = [
    'AssessmentResultRepositoryTest',
    'ResultVersionRepositoryTest',
    'QuestionScoreRepositoryTest',
    'CompetencyScoreRepositoryTest',
    'ResultPublicationRepositoryTest',
    'ManualScoreReviewRepositoryTest',
    'AssessmentResultPolicyTest',
    'ResultPublicationPolicyTest',
    'ManualScoreReviewPolicyTest',
    'CalculateResultRequestTest',
    'PublishResultRequestTest',
    'ManualReviewRequestTest',
];

const serviceTests = {
    'ScoringServiceTest': [
        'test_result_calculates_successfully',
    ],
    'CompetencyEvaluationServiceTest': [
        'test_competency_pass',
        'test_competency_fail',
        'test_threshold_evaluation'
    ],
    'ResultServiceTest': [
        'test_result_snapshot_created',
        'test_result_version_created',
        'test_recalculation_creates_new_version',
        'test_historical_versions_unchanged',
        'test_snapshot_hash_generated',
        'test_snapshot_hash_unique'
    ],
    'PublicationServiceTest': [
        'test_publish_ready_result',
        'test_archive_published_result',
        'test_illegal_publication_transition_fails'
    ],
    'ManualReviewServiceTest': [
        'test_manual_review_created',
        'test_manual_review_creates_new_version',
        'test_manual_review_audit_created'
    ],
    'ReportingServiceTest': [
        'test_assessment_report_returns_data',
        'test_competency_report_returns_data',
        'test_pass_fail_report_returns_data'
    ]
};

const featureTests = {
    'AssessmentResultApiTest': [
        'test_invalid_uuid_rejected',
        'test_snapshot_payload_hidden_from_api',
        'test_candidate_can_view_own_result',
        'test_candidate_cannot_view_foreign_result'
    ],
    'ResultPublicationApiTest': [
    ],
    'ManualReviewApiTest': [
        'test_negative_score_rejected'
    ],
    'ReportingApiTest': [
    ],
    'TenantIsolationTest': [
        'test_cross_tenant_access_denied',
        'test_cross_tenant_publication_denied'
    ],
    'PlatformAdminOverrideTest': [
        'test_platform_admin_can_access_all_results'
    ]
};

const generateClass = (namespace, className, methods) => {
    let methodsString = methods.map(m => `
    public function ${m}(): void
    {
        $this->markTestIncomplete('Test scaffolded for Sprint 4 phase 11.');
    }`).join('\\n');

    if (methods.length === 0) {
        methodsString = `
    public function test_basic_setup(): void
    {
        $this->assertTrue(true);
    }`;
    }

    return `<?php

declare(strict_types=1);

namespace Tests\\${namespace}\\Modules\\Results;

use Tests\\TestCase;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class ${className} extends TestCase
{
    use RefreshDatabase;
${methodsString}
}
`;
};

// Generate Unit Tests
unitTests.forEach(test => {
    writePhpFile(path.join(unitDir, `${test}.php`), generateClass('Unit', test, []));
});

Object.entries(serviceTests).forEach(([testName, methods]) => {
    writePhpFile(path.join(unitDir, `${testName}.php`), generateClass('Unit', testName, methods));
});

// Generate Feature Tests
Object.entries(featureTests).forEach(([testName, methods]) => {
    writePhpFile(path.join(featureDir, `${testName}.php`), generateClass('Feature', testName, methods));
});

console.log('Sprint 04 Phase 11 Test Scaffolding generated successfully.');
