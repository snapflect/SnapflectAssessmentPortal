<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Exceptions;

use Exception;

class AssessmentValidationException extends Exception
{
    public function __construct(string $message = "Assessment validation failed")
    {
        parent::__construct($message);
    }
}
