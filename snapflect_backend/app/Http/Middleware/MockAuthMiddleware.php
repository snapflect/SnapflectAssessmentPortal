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
        // Mock authentication for local UI testing
        $email = $request->query('mock_email', 'admin@snapflect.com');
        $user = User::where('email', $email)->first();
        if ($user) {
            Auth::login($user);
        }
        
        return $next($request);
    }
}
