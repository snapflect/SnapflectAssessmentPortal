<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Modules\Billing\Services\SubscriptionService;

class EnsureActiveSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for unauthenticated routes
        if (!$request->user()) {
            return $next($request);
        }

        $orgId = $request->user()->organization_id;

        // Platform Admin doesn't need a subscription (they are super admins)
        if ($orgId === 1) { // Assuming org 1 is the platform owner
            return $next($request);
        }

        $subscriptionService = app(SubscriptionService::class);

        if (!$subscriptionService->checkAccess($orgId)) {
            return response()->json([
                'error' => 'Payment Required',
                'message' => 'Your organization\'s subscription has expired or is inactive. Please contact your administrator or renew your subscription.'
            ], 402);
        }

        return $next($request);
    }
}
