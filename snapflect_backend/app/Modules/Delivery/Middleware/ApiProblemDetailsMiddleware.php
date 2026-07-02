<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Modules\Delivery\Exceptions\ApiProblemDetailsRenderer;
use Throwable;

class ApiProblemDetailsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (Throwable $e) {
            $response = ApiProblemDetailsRenderer::render($request, $e);
            
            if ($response) {
                return $response;
            }

            throw $e;
        }
    }
}
