<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Throwable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ApiProblemDetailsRenderer
{
    /**
     * Renders an exception into an RFC7807 ProblemDetails JSON response.
     */
    public static function render(Request $request, Throwable $exception): ?JsonResponse
    {
        // Scoped exclusively to the API
        if (!$request->is('api/*')) {
            return null;
        }

        $status = self::determineStatus($exception);
        $errorCode = self::determineErrorCode($exception);
        $title = self::determineTitle($exception);
        $detail = self::determineDetail($exception);

        return response()->json([
            'type' => "https://api.snapflect.com/errors/" . Str::slug($errorCode),
            'title' => $title,
            'status' => $status,
            'detail' => $detail,
            'errorCode' => $errorCode,
            'traceId' => Str::uuid()->toString(),
            'timestamp' => Carbon::now('UTC')->toIso8601String(),
        ], $status, [
            'Content-Type' => 'application/problem+json'
        ]);
    }

    private static function determineStatus(Throwable $e): int
    {
        if ($e instanceof AuthenticationException) {
            return 401;
        }

        if ($e instanceof ValidationException) {
            return 422;
        }

        if ($e instanceof HttpExceptionInterface) {
            return $e->getStatusCode();
        }

        if ($e instanceof \App\Core\Exceptions\TenantValidationException) {
            return 400;
        }

        if ($e instanceof SubmissionException) {
            return match ($e->getErrorCode()) {
                SubmissionException::ATTEMPT_NOT_FOUND => 404,
                SubmissionException::SNAPSHOT_NOT_FOUND => 404,
                SubmissionException::INVALID_SUBMISSION_STATE => 400,
                SubmissionException::ATTEMPT_CANCELLED => 400,
                SubmissionException::SUBMISSION_NOT_ALLOWED => 403,
                SubmissionException::ATTEMPT_ALREADY_SUBMITTED => 403,
                SubmissionException::RANDOMIZATION_DATA_CORRUPTED => 500,
                SubmissionException::DRAFT_DATA_CORRUPTED => 500,
                SubmissionException::ATTEMPT_FINALIZATION_FAILED => 500,
                default => 400,
            };
        }

        if ($e instanceof SessionLaunchException) {
            return 400;
        }
        
        if ($e instanceof AutoSaveException) {
            if ($e->getMessage() === 'Stale draft version detected.') {
                return 409;
            }
            return 422;
        }
        
        if ($e instanceof ResumeException) {
            return match ($e->getErrorCode()) {
                ResumeException::ATTEMPT_EXPIRED => 403,
                ResumeException::ATTEMPT_SUBMITTED => 403,
                ResumeException::ATTEMPT_NOT_FOUND => 404,
                ResumeException::SNAPSHOT_NOT_FOUND => 404,
                ResumeException::INVALID_RESUME_STATE => 400,
                default => 500,
            };
        }

        return 500;
    }

    private static function determineErrorCode(Throwable $e): string
    {
        if ($e instanceof AuthenticationException) {
            return 'UNAUTHORIZED';
        }

        if ($e instanceof ValidationException) {
            return 'VALIDATION_FAILED';
        }

        if ($e instanceof SubmissionException) {
            return $e->getErrorCode();
        }

        if ($e instanceof \App\Core\Exceptions\TenantValidationException) {
            return 'TENANT_VALIDATION_FAILED';
        }

        if ($e instanceof SessionLaunchException) {
            return 'SESSION_LAUNCH_FAILED';
        }
        
        if ($e instanceof AutoSaveException) {
            if ($e->getMessage() === 'Stale draft version detected.') {
                return 'STALE_DRAFT_VERSION';
            }
            return 'AUTO_SAVE_FAILED';
        }
        
        if ($e instanceof ResumeException) {
            if (str_contains($e->getMessage(), 'expired')) {
                return 'ATTEMPT_EXPIRED';
            }
            if (str_contains($e->getMessage(), 'SUBMITTED')) {
                return 'ATTEMPT_SUBMITTED';
            }
            return 'RESUME_FAILED';
        }

        if ($e instanceof HttpExceptionInterface) {
            return match ($e->getStatusCode()) {
                401 => 'UNAUTHORIZED',
                403 => 'FORBIDDEN',
                404 => 'NOT_FOUND',
                default => 'HTTP_ERROR'
            };
        }

        return 'INTERNAL_SERVER_ERROR';
    }

    private static function determineTitle(Throwable $e): string
    {
        return Str::headline(strtolower(self::determineErrorCode($e)));
    }

    private static function determineDetail(Throwable $e): string|array
    {
        if ($e instanceof ValidationException) {
            return $e->errors();
        }
        
        return $e->getMessage();
    }
}
