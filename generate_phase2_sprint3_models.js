const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'Models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const writeModel = (filename, content) => {
    fs.writeFileSync(path.join(modelsDir, filename), content);
};

const template = (className, imports, traitUse, body) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Models;

use Illuminate\\Database\\Eloquent\\Model;
${imports.join('\\n')}

class ${className} extends Model
{
    ${traitUse}

${body}
}
`;

const models = [
    {
        name: 'AssessmentSession.php',
        className: 'AssessmentSession',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\HasAuditFields;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
            'Illuminate\\Database\\Eloquent\\Relations\\HasOne;',
            'App\\Modules\\Assessment\\Models\\Assessment;',
            'App\\Modules\\Assessment\\Models\\AssessmentVersion;',
            'App\\Modules\\Assessment\\Models\\AssessmentSnapshot;',
            'App\\Modules\\Security\\Models\\User;'
        ],
        traitUse: 'use HasUuid, HasAuditFields, BelongsToOrganization;',
        body: `    protected $table = 'assessment_sessions';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'access_started_at' => 'datetime',
        'access_expires_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    protected $hidden = [
        'id',
        'assessment_id',
        'assessment_version_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function assessmentVersion(): BelongsTo
    {
        return $this->belongsTo(AssessmentVersion::class);
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(AssessmentSnapshot::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_user_id');
    }

    public function attempt(): HasOne
    {
        return $this->hasOne(AssessmentAttempt::class);
    }`
    },
    {
        name: 'AssessmentAttempt.php',
        className: 'AssessmentAttempt',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\HasAuditFields;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
            'Illuminate\\Database\\Eloquent\\Relations\\HasMany;',
            'Illuminate\\Database\\Eloquent\\Relations\\HasOne;',
            'App\\Modules\\Assessment\\Models\\Assessment;',
            'App\\Modules\\Assessment\\Models\\AssessmentVersion;',
            'App\\Modules\\Assessment\\Models\\AssessmentSnapshot;',
            'App\\Modules\\Security\\Models\\User;'
        ],
        traitUse: 'use HasUuid, HasAuditFields, BelongsToOrganization;',
        body: `    protected $table = 'assessment_attempts';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'submitted_at' => 'datetime',
        'completion_percentage' => 'decimal:2',
    ];

    protected $hidden = [
        'id',
        'assessment_session_id',
        'assessment_id',
        'assessment_version_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AssessmentSession::class, 'assessment_session_id');
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function assessmentVersion(): BelongsTo
    {
        return $this->belongsTo(AssessmentVersion::class);
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(AssessmentSnapshot::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_user_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(AttemptSection::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AttemptQuestion::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CandidateAnswer::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(AttemptEvent::class);
    }

    public function audits(): HasMany
    {
        return $this->hasMany(AttemptAudit::class);
    }

    public function submission(): HasOne
    {
        return $this->hasOne(AttemptSubmission::class);
    }`
    },
    {
        name: 'AttemptSection.php',
        className: 'AttemptSection',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\HasAuditFields;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
            'Illuminate\\Database\\Eloquent\\Relations\\HasMany;'
        ],
        traitUse: 'use HasUuid, HasAuditFields, BelongsToOrganization;',
        body: `    protected $table = 'attempt_sections';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'blueprint_section_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AttemptQuestion::class);
    }`
    },
    {
        name: 'AttemptQuestion.php',
        className: 'AttemptQuestion',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\HasAuditFields;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
            'Illuminate\\Database\\Eloquent\\Relations\\HasMany;'
        ],
        traitUse: 'use HasUuid, HasAuditFields, BelongsToOrganization;',
        body: `    protected $table = 'attempt_questions';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'is_flagged' => 'boolean',
        'viewed_at' => 'datetime',
        'answered_at' => 'datetime',
        'max_score' => 'decimal:2',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'attempt_section_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(AttemptSection::class, 'attempt_section_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CandidateAnswer::class);
    }`
    },
    {
        name: 'CandidateAnswer.php',
        className: 'CandidateAnswer',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\HasAuditFields;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;'
        ],
        traitUse: 'use HasUuid, HasAuditFields, BelongsToOrganization;',
        body: `    protected $table = 'candidate_answers';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $casts = [
        'is_deleted' => 'boolean',
        'is_final_answer' => 'boolean',
        'saved_at' => 'datetime',
        'numeric_answer' => 'decimal:4',
        'selected_option_uuids_json' => 'array',
        'answer_json' => 'array',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'attempt_question_id',
        'created_by',
        'modified_by',
        'deleted_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(AttemptQuestion::class, 'attempt_question_id');
    }`
    },
    {
        name: 'AttemptEvent.php',
        className: 'AttemptEvent',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;'
        ],
        traitUse: 'use HasUuid, BelongsToOrganization;',
        body: `    protected $table = 'attempt_events';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $casts = [
        'event_timestamp' => 'datetime',
        'event_data_json' => 'array',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'created_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }`
    },
    {
        name: 'AttemptAudit.php',
        className: 'AttemptAudit',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;'
        ],
        traitUse: 'use HasUuid, BelongsToOrganization;',
        body: `    protected $table = 'attempt_audits';

    public $timestamps = false;

    protected $casts = [
        'changed_at' => 'datetime',
        'old_value_json' => 'array',
        'new_value_json' => 'array',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'changed_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }`
    },
    {
        name: 'AttemptSubmission.php',
        className: 'AttemptSubmission',
        imports: [
            'App\\Shared\\Traits\\HasUuid;',
            'App\\Shared\\Traits\\BelongsToOrganization;',
            'Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;',
            'App\\Modules\\Assessment\\Models\\AssessmentSnapshot;',
            'App\\Modules\\Security\\Models\\User;'
        ],
        traitUse: 'use HasUuid, BelongsToOrganization;',
        body: `    protected $table = 'attempt_submissions';

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    protected $hidden = [
        'id',
        'assessment_attempt_id',
        'created_by',
    ];

    protected $guarded = ['id'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    public function assessmentSnapshot(): BelongsTo
    {
        return $this->belongsTo(AssessmentSnapshot::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_user_id');
    }`
    }
];

models.forEach(m => {
    writeModel(m.name, template(m.className, m.imports, m.traitUse, m.body));
});

console.log('Sprint 03 Models generated.');
