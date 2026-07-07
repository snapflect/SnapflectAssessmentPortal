<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Context;

use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class TenantContextResolver
{
    public function resolve(Request $request): TenantContext
    {
        $user = $request->user();

        if (!$user) {
            throw new \Illuminate\Auth\AuthenticationException('Unauthenticated context.');
        }

        if (!$user->organization_id) {
            throw new AccessDeniedHttpException('User does not belong to an organization.');
        }

        return new TenantContext(
            $user->id,
            $user->organization_id
        );
    }
}
