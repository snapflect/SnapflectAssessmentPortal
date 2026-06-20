const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'Models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const writePhpFile = (filename, content) => {
    fs.writeFileSync(path.join(modelsDir, filename), content);
};

const models = [
    {
        name: 'AssessmentResult',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_id',
        'assessment_version_id',
        'assessment_snapshot_id',
        'assessment_attempt_id',
        'candidate_user_id',
        'result_reference',
        'result_version',
        'overall_score',
        'overall_percentage',
        'pass_fail_status',
        'result_status',
        'calculated_at',
        'published_at',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'calculated_at' => 'datetime',
        'published_at' => 'datetime',
        'overall_score' => 'decimal:2',
        'overall_percentage' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function organization(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Security\\Models\\Organization::class);
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Assessment\\Models\\Assessment::class);
    }

    public function assessmentVersion(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Assessment\\Models\\AssessmentVersion::class);
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Assessment\\Models\\AssessmentSnapshot::class);
    }

    public function assessmentAttempt(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Delivery\\Models\\AssessmentAttempt::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Security\\Models\\User::class, 'candidate_user_id');
    }

    public function resultVersions(): HasMany
    {
        return $this->hasMany(ResultVersion::class);
    }

    public function questionScores(): HasMany
    {
        return $this->hasMany(QuestionScore::class);
    }

    public function sectionScores(): HasMany
    {
        return $this->hasMany(SectionScore::class);
    }

    public function competencyScores(): HasMany
    {
        return $this->hasMany(CompetencyScore::class);
    }

    public function resultRules(): HasMany
    {
        return $this->hasMany(ResultRule::class);
    }

    public function resultPublications(): HasMany
    {
        return $this->hasMany(ResultPublication::class);
    }

    public function resultAudits(): HasMany
    {
        return $this->hasMany(ResultAudit::class);
    }

    public function resultSnapshots(): HasMany
    {
        return $this->hasMany(ResultSnapshot::class);
    }

    public function manualScoreReviews(): HasMany
    {
        return $this->hasMany(ManualScoreReview::class);
    }`
    },
    {
        name: 'ResultVersion',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'version_number',
        'version_label',
        'version_reason',
        'is_current_version',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'is_current_version' => 'boolean',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }`
    },
    {
        name: 'QuestionScore',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'question_id',
        'attempt_question_id',
        'max_score',
        'awarded_score',
        'percentage',
        'scoring_type',
        'scoring_notes',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'max_score' => 'decimal:2',
        'awarded_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Assessment\\Models\\Question::class);
    }

    public function attemptQuestion(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Delivery\\Models\\AttemptQuestion::class);
    }`
    },
    {
        name: 'SectionScore',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'assessment_section_id',
        'section_score',
        'section_percentage',
        'section_weight',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'section_score' => 'decimal:2',
        'section_percentage' => 'decimal:2',
        'section_weight' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }`
    },
    {
        name: 'CompetencyScore',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'competency_id',
        'competency_score',
        'competency_percentage',
        'threshold_score',
        'competency_status',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'competency_score' => 'decimal:2',
        'competency_percentage' => 'decimal:2',
        'threshold_score' => 'decimal:2',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Assessment\\Models\\Competency::class);
    }`
    },
    {
        name: 'ResultRule',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'rule_name',
        'rule_type',
        'rule_expression',
        'rule_result',
        'evaluation_notes',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'rule_result' => 'boolean',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }`
    },
    {
        name: 'ResultPublication',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'publication_status',
        'published_by',
        'published_at',
        'archived_by',
        'archived_at',
        'publication_notes',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'published_at' => 'datetime',
        'archived_at' => 'datetime',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Security\\Models\\User::class, 'published_by');
    }`
    },
    {
        name: 'ResultAudit',
        traits: ['HasUuid', 'BelongsToOrganization'], // Immutable
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'audit_type',
        'audit_description',
        'old_value_json',
        'new_value_json',
        'performed_by',
        'performed_at',`,
        casts: `        'old_value_json' => 'array',
        'new_value_json' => 'array',
        'performed_at' => 'datetime',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Security\\Models\\User::class, 'performed_by');
    }`
    },
    {
        name: 'ResultSnapshot',
        traits: ['HasUuid', 'BelongsToOrganization'], // Immutable
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'result_version_id',
        'snapshot_hash',
        'snapshot_json',
        'rules_snapshot_json',
        'calculated_at',`,
        casts: `        'snapshot_json' => 'array',
        'rules_snapshot_json' => 'array',
        'calculated_at' => 'datetime',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function resultVersion(): BelongsTo
    {
        return $this->belongsTo(ResultVersion::class);
    }`
    },
    {
        name: 'ManualScoreReview',
        traits: ['HasUuid', 'BelongsToOrganization', 'HasAuditFields'],
        fillable: `        'uuid',
        'organization_id',
        'assessment_result_id',
        'question_score_id',
        'reviewed_by',
        'review_status',
        'original_score',
        'reviewed_score',
        'review_comments',
        'reviewed_at',
        'status',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date',
        'is_deleted',
        'deleted_by',
        'deleted_date',`,
        casts: `        'original_score' => 'decimal:2',
        'reviewed_score' => 'decimal:2',
        'reviewed_at' => 'datetime',
        'created_date' => 'datetime',
        'modified_date' => 'datetime',
        'deleted_date' => 'datetime',
        'is_deleted' => 'boolean',`,
        relationships: `
    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function questionScore(): BelongsTo
    {
        return $this->belongsTo(QuestionScore::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(\\App\\Modules\\Security\\Models\\User::class, 'reviewed_by');
    }`
    }
];

const template = (model) => {
    let useStatements = [
        'use Illuminate\\Database\\Eloquent\\Model;',
        'use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
        'use Illuminate\\Database\\Eloquent\\Relations\\HasMany;',
        'use App\\Shared\\Traits\\HasUuid;',
        'use App\\Shared\\Traits\\BelongsToOrganization;'
    ];

    if (model.traits.includes('HasAuditFields')) {
        useStatements.push('use App\\Shared\\Traits\\HasAuditFields;');
    }

    return `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Models;

${useStatements.join('\\n')}

class ${model.name} extends Model
{
    use ${model.traits.join(', ')};

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = '${model.name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}s';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
${model.fillable}
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
${model.casts}
    ];
${model.relationships}
}
`;
};

// Handle special case where some table names don't map perfectly with simple pluralization
const writeTemplate = (model) => {
    let t = template(model);
    if (model.name === 'CompetencyScore') {
        t = t.replace(/protected \$table = 'competency_scores';/g, "protected $table = 'competency_scores';");
    }
    return t;
};

models.forEach(model => {
    writePhpFile(`${model.name}.php`, writeTemplate(model));
});

console.log('Sprint 04 Phase 2 Models generated successfully.');
