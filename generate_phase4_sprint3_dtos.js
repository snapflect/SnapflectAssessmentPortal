const fs = require('fs');
const path = require('path');

const dtosDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'DTOs');
if (!fs.existsSync(dtosDir)) {
    fs.mkdirSync(dtosDir, { recursive: true });
}

const writeDto = (filename, content) => {
    fs.writeFileSync(path.join(dtosDir, filename), content);
};

const dtos = [
    {
        name: 'LaunchAssessmentDto',
        props: [
            'public string $candidate_uuid',
            'public string $assessment_version_uuid'
        ]
    },
    {
        name: 'ResumeSessionDto',
        props: [
            'public string $session_uuid',
            'public string $candidate_uuid'
        ]
    },
    {
        name: 'TerminateSessionDto',
        props: [
            'public string $session_uuid',
            'public ?string $reason'
        ]
    },
    {
        name: 'CreateAttemptDto',
        props: [
            'public string $session_uuid',
            'public string $candidate_uuid'
        ]
    },
    {
        name: 'UpdateAttemptProgressDto',
        props: [
            'public string $attempt_uuid',
            'public int $answered_questions',
            'public int $unanswered_questions',
            'public int $flagged_questions',
            'public float $completion_percentage',
            'public int $remaining_seconds'
        ]
    },
    {
        name: 'ExpireAttemptDto',
        props: [
            'public string $attempt_uuid',
            'public ?string $reason'
        ]
    },
    {
        name: 'SubmitAttemptDto',
        props: [
            'public string $attempt_uuid',
            'public bool $confirmation',
            'public string $submitted_at'
        ]
    },
    {
        name: 'LoadAttemptQuestionsDto',
        props: [
            'public string $attempt_uuid',
            'public ?string $section_uuid'
        ]
    },
    {
        name: 'NavigateQuestionDto',
        props: [
            'public string $attempt_uuid',
            'public string $current_question_uuid',
            'public string $target_question_uuid'
        ]
    },
    {
        name: 'FlagQuestionDto',
        props: [
            'public string $attempt_uuid',
            'public string $question_uuid',
            'public bool $is_flagged'
        ]
    },
    {
        name: 'CreateAnswerDto',
        props: [
            'public string $attempt_uuid',
            'public string $question_uuid',
            'public string $answer_type',
            'public ?string $selected_option_uuid',
            'public ?array $selected_option_uuids_json',
            'public ?string $text_answer',
            'public ?float $numeric_answer',
            'public ?array $answer_json'
        ]
    },
    {
        name: 'UpdateAnswerDto',
        props: [
            'public string $answer_uuid',
            'public string $answer_type',
            'public ?string $selected_option_uuid',
            'public ?array $selected_option_uuids_json',
            'public ?string $text_answer',
            'public ?float $numeric_answer',
            'public ?array $answer_json'
        ]
    },
    {
        name: 'AutoSaveAnswerDto',
        props: [
            'public string $attempt_uuid',
            'public string $question_uuid',
            'public array $answer_json',
            'public string $saved_at',
            'public int $answer_version'
        ]
    },
    {
        name: 'CreateAttemptEventDto',
        props: [
            'public string $attempt_uuid',
            'public string $candidate_uuid',
            'public string $event_type',
            'public ?string $event_description',
            'public ?array $event_data_json',
            'public ?string $ip_address',
            'public ?string $user_agent'
        ]
    },
    {
        name: 'CreateAttemptAuditDto',
        props: [
            'public string $attempt_uuid',
            'public string $entity_name',
            'public string $entity_uuid',
            'public string $action_type',
            'public ?array $old_value_json',
            'public ?array $new_value_json'
        ]
    },
    {
        name: 'CreateSubmissionDto',
        props: [
            'public string $attempt_uuid',
            'public string $snapshot_uuid',
            'public string $candidate_uuid',
            'public string $submission_type',
            'public int $total_answered',
            'public int $total_unanswered',
            'public int $final_duration_seconds'
        ]
    }
];

const generateTemplate = (dto) => {
    const constructorArgs = dto.props.join(',\\n        ');
    const toArrayBody = dto.props.map(p => {
        const varName = p.split(' ').pop().replace('$', '');
        return `            '${varName}' => $this->${varName},`;
    }).join('\\n');
    
    const fromArrayArgs = dto.props.map(p => {
        const parts = p.split(' ');
        const type = parts[1];
        const varName = parts[2].replace('$', '');
        return `            $data['${varName}'] ?? null`;
    }).join(',\\n            ');

    return `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\DTOs;

readonly class ${dto.name}
{
    public function __construct(
        ${constructorArgs}
    ) {}

    public function toArray(): array
    {
        return [
${toArrayBody}
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
${fromArrayArgs}
        );
    }
}
`;
};

dtos.forEach(dto => {
    writeDto(dto.name + '.php', generateTemplate(dto));
});

console.log('Sprint 03 DTOs generated.');
