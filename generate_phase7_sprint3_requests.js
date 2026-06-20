const fs = require('fs');
const path = require('path');

const requestsDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'Requests');
if (!fs.existsSync(requestsDir)) {
    fs.mkdirSync(requestsDir, { recursive: true });
}

const writePhpFile = (filename, content) => {
    fs.writeFileSync(path.join(requestsDir, filename), content);
};

const requests = [
    {
        name: 'LaunchAssessmentRequest',
        dtoClass: 'LaunchAssessmentDto',
        rules: `            'assessment_uuid' => ['required', 'uuid'],`,
        toDtoArgs: `string $candidateUuid`,
        toDtoBody: `        return new LaunchAssessmentDto(
            $candidateUuid,
            $this->validated('assessment_uuid')
        );`
    },
    {
        name: 'ResumeSessionRequest',
        dtoClass: 'ResumeSessionDto',
        rules: `            'session_uuid' => ['required', 'uuid'],`,
        toDtoArgs: `string $candidateUuid`,
        toDtoBody: `        return new ResumeSessionDto(
            $this->validated('session_uuid'),
            $candidateUuid
        );`
    },
    {
        name: 'TerminateSessionRequest',
        dtoClass: 'TerminateSessionDto',
        rules: `            'session_uuid' => ['required', 'uuid'],
            'reason' => ['nullable', 'string', 'max:500'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new TerminateSessionDto(
            $this->validated('session_uuid'),
            $this->validated('reason')
        );`
    },
    {
        name: 'SubmitAssessmentRequest',
        dtoClass: 'SubmitAttemptDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'confirmation' => ['required', 'boolean'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new SubmitAttemptDto(
            $this->validated('attempt_uuid'),
            $this->validated('confirmation'),
            now()->toDateTimeString()
        );`
    },
    {
        name: 'ExpireAttemptRequest',
        dtoClass: 'ExpireAttemptDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'reason' => ['nullable', 'string', 'max:500'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new ExpireAttemptDto(
            $this->validated('attempt_uuid'),
            $this->validated('reason')
        );`
    },
    {
        name: 'FlagQuestionRequest',
        dtoClass: 'FlagQuestionDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'attempt_question_uuid' => ['required', 'uuid'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new FlagQuestionDto(
            $this->validated('attempt_uuid'),
            $this->validated('attempt_question_uuid'),
            true
        );`
    },
    {
        name: 'UnflagQuestionRequest',
        dtoClass: 'FlagQuestionDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'attempt_question_uuid' => ['required', 'uuid'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new FlagQuestionDto(
            $this->validated('attempt_uuid'),
            $this->validated('attempt_question_uuid'),
            false
        );`
    },
    {
        name: 'NavigateQuestionRequest',
        dtoClass: 'NavigateQuestionDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'current_question_uuid' => ['required', 'uuid'],
            'target_question_uuid' => ['required', 'uuid'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new NavigateQuestionDto(
            $this->validated('attempt_uuid'),
            $this->validated('current_question_uuid'),
            $this->validated('target_question_uuid')
        );`
    },
    {
        name: 'CreateAnswerRequest',
        dtoClass: 'CreateAnswerDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'attempt_question_uuid' => ['required', 'uuid'],
            'answer_type' => ['required', 'string', 'in:SINGLE_CHOICE,MULTIPLE_CHOICE,TRUE_FALSE,SHORT_TEXT,LONG_TEXT,NUMERIC'],
            'selected_option_uuid' => ['nullable', 'uuid'],
            'selected_option_uuids_json' => ['nullable', 'array'],
            'text_answer' => ['nullable', 'string'],
            'numeric_answer' => ['nullable', 'numeric'],
            'answer_json' => ['nullable', 'array'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new CreateAnswerDto(
            $this->validated('attempt_uuid'),
            $this->validated('attempt_question_uuid'),
            $this->validated('answer_type'),
            $this->validated('selected_option_uuid'),
            $this->validated('selected_option_uuids_json'),
            $this->validated('text_answer'),
            $this->validated('numeric_answer') ? (float) $this->validated('numeric_answer') : null,
            $this->validated('answer_json')
        );`
    },
    {
        name: 'UpdateAnswerRequest',
        dtoClass: 'UpdateAnswerDto',
        rules: `            'answer_uuid' => ['required', 'uuid'],
            'answer_type' => ['required', 'string', 'in:SINGLE_CHOICE,MULTIPLE_CHOICE,TRUE_FALSE,SHORT_TEXT,LONG_TEXT,NUMERIC'],
            'selected_option_uuid' => ['nullable', 'uuid'],
            'selected_option_uuids_json' => ['nullable', 'array'],
            'text_answer' => ['nullable', 'string'],
            'numeric_answer' => ['nullable', 'numeric'],
            'answer_json' => ['nullable', 'array'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new UpdateAnswerDto(
            $this->validated('answer_uuid'),
            $this->validated('answer_type'),
            $this->validated('selected_option_uuid'),
            $this->validated('selected_option_uuids_json'),
            $this->validated('text_answer'),
            $this->validated('numeric_answer') ? (float) $this->validated('numeric_answer') : null,
            $this->validated('answer_json')
        );`
    },
    {
        name: 'AutoSaveAnswerRequest',
        dtoClass: 'AutoSaveAnswerDto',
        rules: `            'attempt_uuid' => ['required', 'uuid'],
            'attempt_question_uuid' => ['required', 'uuid'],
            'answer_json' => ['required', 'array'],
            'answer_version' => ['required', 'integer', 'min:1'],`,
        toDtoArgs: ``,
        toDtoBody: `        return new AutoSaveAnswerDto(
            $this->validated('attempt_uuid'),
            $this->validated('attempt_question_uuid'),
            $this->validated('answer_json'),
            now()->toDateTimeString(),
            (int) $this->validated('answer_version')
        );`
    },
    {
        name: 'GetAttemptEventsRequest',
        dtoClass: null,
        rules: `            'attempt_uuid' => ['required', 'uuid'],`,
        toDtoArgs: ``,
        toDtoBody: null
    },
    {
        name: 'GetAttemptAuditsRequest',
        dtoClass: null,
        rules: `            'attempt_uuid' => ['required', 'uuid'],`,
        toDtoArgs: ``,
        toDtoBody: null
    }
];

const template = (req) => {
    let toDtoMethod = '';
    let dtoImport = '';

    if (req.dtoClass && req.toDtoBody) {
        dtoImport = `use App\\Modules\\Delivery\\DTOs\\${req.dtoClass};\n`;
        toDtoMethod = `
    public function toDto(${req.toDtoArgs}): ${req.dtoClass}
    {
${req.toDtoBody}
    }
`;
    }

    return `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;
${dtoImport}
class ${req.name} extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
${req.rules}
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'The :attribute field is required.',
            'uuid' => 'The :attribute must be a valid UUID.',
            'boolean' => 'The :attribute must be true or false.',
            'in' => 'The :attribute must be one of the following types: :values',
        ];
    }

    public function attributes(): array
    {
        return [
            'assessment_uuid' => 'Assessment',
            'session_uuid' => 'Session',
            'attempt_uuid' => 'Attempt',
            'attempt_question_uuid' => 'Question',
            'answer_uuid' => 'Answer',
            'answer_type' => 'Answer Type',
            'answer_json' => 'Answer Payload',
        ];
    }
${toDtoMethod}
}
`;
};

requests.forEach(req => {
    writePhpFile(`${req.name}.php`, template(req));
});

console.log('Sprint 03 Requests generated.');
