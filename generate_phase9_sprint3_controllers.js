const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Delivery', 'Controllers');
if (!fs.existsSync(controllersDir)) {
    fs.mkdirSync(controllersDir, { recursive: true });
}

const writePhpFile = (filename, content) => {
    fs.writeFileSync(path.join(controllersDir, filename), content);
};

const controllers = [
    {
        name: 'AssessmentSessionController',
        imports: [
            'App\\Http\\Controllers\\Controller;',
            'Illuminate\\Http\\JsonResponse;',
            'Illuminate\\Http\\Request;',
            'App\\Modules\\Delivery\\Models\\AssessmentSession;',
            'App\\Modules\\Delivery\\Services\\AssessmentSessionService;',
            'App\\Modules\\Delivery\\Requests\\LaunchAssessmentRequest;',
            'App\\Modules\\Delivery\\Requests\\ResumeSessionRequest;',
            'App\\Modules\\Delivery\\Requests\\TerminateSessionRequest;',
            'App\\Modules\\Delivery\\Resources\\AssessmentSessionResource;',
        ],
        body: `    public function __construct(
        private readonly AssessmentSessionService $sessionService
    ) {}

    public function launch(LaunchAssessmentRequest $request): JsonResponse
    {
        // No explicit policy for launch as it creates the session, 
        // Candidate access is validated inside the service.
        $sessionData = $this->sessionService->launchAssessment($request->toDto($request->user()->uuid));

        return response()->json([
            'success' => true,
            'message' => 'Assessment session launched successfully.',
            'data' => $sessionData
        ]);
    }

    public function resume(ResumeSessionRequest $request, AssessmentSession $session): JsonResponse
    {
        $this->authorize('resume', $session);

        $sessionData = $this->sessionService->resumeSession($request->toDto($request->user()->uuid));

        return response()->json([
            'success' => true,
            'message' => 'Assessment session resumed successfully.',
            'data' => $sessionData
        ]);
    }

    public function terminate(TerminateSessionRequest $request, AssessmentSession $session): JsonResponse
    {
        $this->authorize('terminate', $session);

        $this->sessionService->terminateSession($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Assessment session terminated successfully.',
            'data' => null
        ]);
    }

    public function show(Request $request, AssessmentSession $session): JsonResponse
    {
        $this->authorize('view', $session);

        return response()->json([
            'success' => true,
            'message' => 'Assessment session retrieved successfully.',
            'data' => new AssessmentSessionResource($session)
        ]);
    }`
    },
    {
        name: 'AssessmentAttemptController',
        imports: [
            'App\\Http\\Controllers\\Controller;',
            'Illuminate\\Http\\JsonResponse;',
            'Illuminate\\Http\\Request;',
            'App\\Modules\\Delivery\\Models\\AssessmentAttempt;',
            'App\\Modules\\Delivery\\Services\\AssessmentAttemptService;',
            'App\\Modules\\Delivery\\Services\\AttemptSubmissionService;',
            'App\\Modules\\Delivery\\Requests\\SubmitAssessmentRequest;',
            'App\\Modules\\Delivery\\Requests\\ExpireAttemptRequest;',
            'App\\Modules\\Delivery\\Resources\\AssessmentAttemptResource;',
        ],
        body: `    public function __construct(
        private readonly AssessmentAttemptService $attemptService,
        private readonly AttemptSubmissionService $submissionService
    ) {}

    public function show(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt retrieved successfully.',
            'data' => new AssessmentAttemptResource($attempt)
        ]);
    }

    public function progress(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        // Returning the resource implicitly includes progress attributes
        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt progress retrieved successfully.',
            'data' => new AssessmentAttemptResource($attempt)
        ]);
    }

    public function submit(SubmitAssessmentRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('submit', $attempt);

        $result = $this->submissionService->submitAssessment($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt submitted successfully.',
            'data' => $result
        ]);
    }

    public function expire(ExpireAttemptRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('forceExpire', $attempt);

        $this->attemptService->expireAttempt($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt expired successfully.',
            'data' => null
        ]);
    }`
    },
    {
        name: 'AttemptQuestionController',
        imports: [
            'App\\Http\\Controllers\\Controller;',
            'Illuminate\\Http\\JsonResponse;',
            'Illuminate\\Http\\Request;',
            'App\\Modules\\Delivery\\Models\\AssessmentAttempt;',
            'App\\Modules\\Delivery\\Models\\AttemptQuestion;',
            'App\\Modules\\Delivery\\Services\\AttemptQuestionService;',
            'App\\Modules\\Delivery\\Services\\CandidateAnswerService;',
            'App\\Modules\\Delivery\\Requests\\NavigateQuestionRequest;',
            'App\\Modules\\Delivery\\Requests\\FlagQuestionRequest;',
            'App\\Modules\\Delivery\\Requests\\UnflagQuestionRequest;',
            'App\\Modules\\Delivery\\DTOs\\LoadAttemptQuestionsDto;',
            'App\\Modules\\Delivery\\Resources\\AttemptQuestionResource;',
        ],
        body: `    public function __construct(
        private readonly AttemptQuestionService $questionService,
        private readonly CandidateAnswerService $answerService
    ) {}

    public function index(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $dto = new LoadAttemptQuestionsDto($attempt->uuid, $request->input('section_uuid'));
        $questions = $this->questionService->loadQuestions($dto);

        return response()->json([
            'success' => true,
            'message' => 'Attempt questions retrieved successfully.',
            'data' => $questions
        ]);
    }

    public function show(Request $request, AttemptQuestion $question): JsonResponse
    {
        $this->authorize('view', $question);

        $questionData = $this->questionService->loadQuestion($question->uuid);

        return response()->json([
            'success' => true,
            'message' => 'Attempt question retrieved successfully.',
            'data' => $questionData
        ]);
    }

    public function next(NavigateQuestionRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $questionData = $this->questionService->nextQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Navigated to next question successfully.',
            'data' => $questionData
        ]);
    }

    public function previous(NavigateQuestionRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $questionData = $this->questionService->previousQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Navigated to previous question successfully.',
            'data' => $questionData
        ]);
    }

    public function jump(NavigateQuestionRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        $questionData = $this->questionService->jumpToQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Jumped to question successfully.',
            'data' => $questionData
        ]);
    }

    public function flag(FlagQuestionRequest $request, AttemptQuestion $question): JsonResponse
    {
        $this->authorize('flag', $question);

        $this->answerService->flagQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Question flagged successfully.',
            'data' => null
        ]);
    }

    public function unflag(UnflagQuestionRequest $request, AttemptQuestion $question): JsonResponse
    {
        $this->authorize('unflag', $question);

        $this->answerService->unflagQuestion($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Question unflagged successfully.',
            'data' => null
        ]);
    }`
    },
    {
        name: 'CandidateAnswerController',
        imports: [
            'App\\Http\\Controllers\\Controller;',
            'Illuminate\\Http\\JsonResponse;',
            'Illuminate\\Http\\Request;',
            'App\\Modules\\Delivery\\Models\\AssessmentAttempt;',
            'App\\Modules\\Delivery\\Models\\CandidateAnswer;',
            'App\\Modules\\Delivery\\Services\\CandidateAnswerService;',
            'App\\Modules\\Delivery\\Requests\\CreateAnswerRequest;',
            'App\\Modules\\Delivery\\Requests\\UpdateAnswerRequest;',
            'App\\Modules\\Delivery\\Requests\\AutoSaveAnswerRequest;',
            'App\\Modules\\Delivery\\Resources\\CandidateAnswerResource;',
        ],
        body: `    public function __construct(
        private readonly CandidateAnswerService $answerService
    ) {}

    public function store(CreateAnswerRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('create', clone $attempt);

        $answerData = $this->answerService->createAnswer($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Answer created successfully.',
            'data' => $answerData
        ]);
    }

    public function update(UpdateAnswerRequest $request, CandidateAnswer $answer): JsonResponse
    {
        $this->authorize('update', clone $answer);

        $answerData = $this->answerService->updateAnswer($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Answer updated successfully.',
            'data' => $answerData
        ]);
    }

    public function autoSave(AutoSaveAnswerRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('autoSave', clone $attempt);

        $this->answerService->autoSaveAnswer($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Answer auto-saved successfully.',
            'data' => null
        ]);
    }

    public function show(Request $request, CandidateAnswer $answer): JsonResponse
    {
        $this->authorize('view', clone $answer);

        return response()->json([
            'success' => true,
            'message' => 'Answer retrieved successfully.',
            'data' => new CandidateAnswerResource($answer)
        ]);
    }`
    },
    {
        name: 'AttemptSubmissionController',
        imports: [
            'App\\Http\\Controllers\\Controller;',
            'Illuminate\\Http\\JsonResponse;',
            'Illuminate\\Http\\Request;',
            'App\\Modules\\Delivery\\Models\\AssessmentAttempt;',
            'App\\Modules\\Delivery\\Models\\AttemptSubmission;',
            'App\\Modules\\Delivery\\Requests\\GetAttemptEventsRequest;',
            'App\\Modules\\Delivery\\Requests\\GetAttemptAuditsRequest;',
            'App\\Modules\\Delivery\\Resources\\AttemptSubmissionResource;',
        ],
        body: `    public function show(Request $request, AttemptSubmission $submission): JsonResponse
    {
        $this->authorize('view', clone $submission);

        return response()->json([
            'success' => true,
            'message' => 'Attempt submission retrieved successfully.',
            'data' => new AttemptSubmissionResource($submission)
        ]);
    }

    public function events(GetAttemptEventsRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', clone $attempt);

        // Assuming events are eager loaded or fetched via relation since DB queries aren't allowed
        // Actually, the architecture would have the service return these, but there's no service
        // call explicitly mapped here. We will just return the resource collection from the relation.
        return response()->json([
            'success' => true,
            'message' => 'Attempt events retrieved successfully.',
            'data' => \App\\Modules\\Delivery\\Resources\\AttemptEventResource::collection($attempt->events)
        ]);
    }

    public function audits(GetAttemptAuditsRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', clone $attempt);

        return response()->json([
            'success' => true,
            'message' => 'Attempt audits retrieved successfully.',
            'data' => \App\\Modules\\Delivery\\Resources\\AttemptAuditResource::collection($attempt->audits)
        ]);
    }`
    }
];

const template = (ctrl) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Delivery\\Controllers;

${ctrl.imports.join('\\n')}

class ${ctrl.name} extends Controller
{
${ctrl.body.replace(/clone /g, '')}
}
`;

controllers.forEach(ctrl => {
    writePhpFile(`${ctrl.name}.php`, template(ctrl));
});

console.log('Sprint 03 Controllers generated.');
