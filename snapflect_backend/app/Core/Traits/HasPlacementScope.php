<?php

namespace App\Core\Traits;

use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait HasPlacementScope
{
    /**
     * Apply structural ABAC (Attribute-Based Access Control) to the given query.
     * 
     * @param Builder $query
     * @param User $user
     * @return Builder
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        // 1. Platform Admins see everything.
        if ($user->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            return $query;
        }

        // 2. Organization boundary is absolute.
        $query->where($query->getModel()->getTable() . '.organization_id', $user->organization_id);

        // 3. Evaluate structural scope based on the user's own placement fields (ABAC).
        // If a placement field is null, it means the user has top-level access for that axis.
        $query->where(function (Builder $q) use ($user, $query) {
            $hasAccessBranch = false;

            if ($user->hasRole('CLIENT_ADMIN')) {
                $q->orWhereRaw('1=1'); // Global org access
                $hasAccessBranch = true;
            }

            // BU Scope
            if ($user->hasRole('BU_MANAGER') || $user->hasRole('ASSESSMENT_MANAGER')) {
                if ($user->business_unit_id === null) {
                    $q->orWhereRaw('1=1'); // Top of BU hierarchy
                } else {
                    $q->orWhere($query->getModel()->getTable() . '.business_unit_id', $user->business_unit_id);
                }
                $hasAccessBranch = true;
            }

            // Dept Scope
            if ($user->hasRole('DEPT_MANAGER') || $user->hasRole('CONTENT_CREATOR')) {
                if ($user->department_id === null) {
                    $q->orWhereRaw('1=1'); // Top of Dept hierarchy
                } else {
                    $q->orWhere($query->getModel()->getTable() . '.department_id', $user->department_id);
                }
                $hasAccessBranch = true;
            }

            // Location Scope (e.g. for Proctors on candidates)
            if ($user->hasRole('PROCTOR')) {
                $table = $query->getModel()->getTable();
                // Proctors only get location scoping on Delivery models, not Governance models.
                if ($table === 'assessment_sessions') {
                    if ($user->location_id === null) {
                        $q->orWhereRaw('1=1');
                    } else {
                        $q->orWhereHas('candidate', function ($sub) use ($user) {
                            $sub->where('location_id', $user->location_id);
                        });
                    }
                    $hasAccessBranch = true;
                }
            }
            
            // LOCATION_MANAGER Scope (Governance models only)
            if ($user->hasRole('LOCATION_MANAGER')) {
                $table = $query->getModel()->getTable();
                if ($table === 'locations' || $table === 'users') {
                    if ($user->location_id === null) {
                        $q->orWhereRaw('1=1');
                    } else {
                        $q->orWhere($query->getModel()->getTable() . '.location_id', $user->location_id);
                    }
                    $hasAccessBranch = true;
                }
            }

            // 4. Deny-by-default safety net
            if (!$hasAccessBranch) {
                $q->whereRaw('1=0'); // User has no roles that grant structural access
            }
        });

        return $query;
    }
}
