<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Modules\Security\Models\User;
use Illuminate\Support\Facades\Auth;

class MockAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $email = $request->query('mock_email', 'admin@snapflect.com');

        $tokenVersion = null;

        // Check if there is a bearer token that is base64 encoded JSON
        $token = $request->bearerToken();
        if ($token) {
            $decoded = base64_decode($token);
            if ($decoded) {
                $payload = json_decode($decoded, true);
                if (is_array($payload) && isset($payload['email'])) {
                    $email = $payload['email'];
                    if (isset($payload['v'])) {
                        $tokenVersion = (int) $payload['v'];
                    }
                }
            }
        }

        $user = User::where('email', $email)->first();
        if ($user) {
            // Verify token version. If it exists in the token, it MUST match the database.
            // (If tokenVersion is null, it's an old token, we can reject it or let it pass. 
            // For security, if they have a token_version > 1, old tokens should be rejected).
            if ($tokenVersion === null && $user->token_version > 1) {
                // Reject old tokens if a force logout has happened
            } elseif ($tokenVersion !== null && $tokenVersion !== $user->token_version) {
                // Reject invalidated tokens
            } else {
                Auth::login($user);
            }
        }
        
        return $next($request);
    }
}
