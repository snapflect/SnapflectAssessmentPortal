<?php

declare(strict_types=1);

namespace App\Modules\Analytics\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Governance\Models\Organization;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Results\Models\ManualScoreReview;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $availableRoles = $user->roles()->pluck('role_code')->toArray();
        if (empty($availableRoles)) {
            $availableRoles = ['CANDIDATE']; // fallback
        }

        // Determine active role context
        $requestedRole = $request->query('role');
        $activeRole = null;

        if ($requestedRole && in_array($requestedRole, $availableRoles)) {
            $activeRole = $requestedRole;
        } else {
            // Default to highest privilege role
            $roleHierarchy = [
                'PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 
                'REVIEWER', 'PROCTOR', 'BILLING_ADMIN', 'SUPPORT', 'READ_ONLY', 'CANDIDATE'
            ];
            foreach ($roleHierarchy as $role) {
                if (in_array($role, $availableRoles)) {
                    $activeRole = $role;
                    break;
                }
            }
            if (!$activeRole) $activeRole = $availableRoles[0];
        }

        $orgId = $user->organization_id;
        $data = [
            'roleContext' => $activeRole,
            'availableRoles' => $availableRoles,
        ];

        // Safe helpers
        $orgCount = class_exists(\App\Modules\Governance\Models\Organization::class) ? \App\Modules\Governance\Models\Organization::where('is_deleted', false)->count() : 0;
        $userCount = class_exists(\App\Modules\Security\Models\User::class) ? \App\Modules\Security\Models\User::where('is_deleted', false)->count() : 0;
        $tenantUserCount = class_exists(\App\Modules\Security\Models\User::class) ? \App\Modules\Security\Models\User::where('organization_id', $orgId)->where('is_deleted', false)->count() : 0;
        
        $assessmentCount = class_exists(\App\Modules\Assessment\Models\Assessment::class) ? \App\Modules\Assessment\Models\Assessment::count() : 0;
        $tenantAssessmentCount = class_exists(\App\Modules\Assessment\Models\Assessment::class) ? \App\Modules\Assessment\Models\Assessment::where('organization_id', $orgId)->count() : 0;
        
        $totalAttempts = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) ? \App\Modules\Delivery\Models\AssessmentAttempt::count() : 0;
        $tenantAttempts = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) ? \App\Modules\Delivery\Models\AssessmentAttempt::where('organization_id', $orgId)->count() : 0;
        
        $activeSessions = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) ? \App\Modules\Delivery\Models\AssessmentAttempt::where('status', 'IN_PROGRESS')->count() : 0;
        $tenantActiveSessions = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) ? \App\Modules\Delivery\Models\AssessmentAttempt::where('organization_id', $orgId)->where('status', 'IN_PROGRESS')->count() : 0;
        
        $pendingReviews = class_exists(\App\Modules\Results\Models\ManualScoreReview::class) ? \App\Modules\Results\Models\ManualScoreReview::where('review_status', 'PENDING')->count() : 0;
        $tenantPendingReviews = class_exists(\App\Modules\Results\Models\ManualScoreReview::class) ? \App\Modules\Results\Models\ManualScoreReview::where('organization_id', $orgId)->where('review_status', 'PENDING')->count() : 0;

        switch ($activeRole) {
            case 'PLATFORM_ADMIN':
                $data['organizations_count'] = $orgCount;
                $data['users_count'] = $userCount;
                $data['assessments_count'] = $assessmentCount;
                $data['active_sessions'] = $activeSessions;
                break;

            case 'CLIENT_ADMIN':
                $data['users_count'] = $tenantUserCount;
                $data['assessments_count'] = $tenantAssessmentCount;
                $data['pending_reviews'] = $tenantPendingReviews;
                $data['active_sessions'] = $tenantActiveSessions;
                break;

            case 'ASSESSMENT_MANAGER':
                $data['assessments_count'] = $tenantAssessmentCount;
                $data['active_question_banks'] = class_exists(\App\Modules\Assessment\Models\QuestionBank::class) ? \App\Modules\Assessment\Models\QuestionBank::where('organization_id', $orgId)->count() : 0;
                $data['pending_reviews'] = $tenantPendingReviews;
                $data['total_attempts'] = $tenantAttempts;
                break;

            case 'CONTENT_CREATOR':
                $data['question_banks_count'] = class_exists(\App\Modules\Assessment\Models\QuestionBank::class) ? \App\Modules\Assessment\Models\QuestionBank::where('organization_id', $orgId)->count() : 0;
                $data['questions_created'] = class_exists(\App\Modules\Assessment\Models\Question::class) ? \App\Modules\Assessment\Models\Question::where('organization_id', $orgId)->count() : 0;
                $data['published_assessments'] = class_exists(\App\Modules\Assessment\Models\Assessment::class) ? \App\Modules\Assessment\Models\Assessment::where('organization_id', $orgId)->where('status', 'PUBLISHED')->count() : 0;
                $data['draft_assessments'] = class_exists(\App\Modules\Assessment\Models\Assessment::class) ? \App\Modules\Assessment\Models\Assessment::where('organization_id', $orgId)->where('status', 'DRAFT')->count() : 0;
                break;

            case 'REVIEWER':
                $data['pending_reviews'] = $tenantPendingReviews;
                $data['completed_reviews'] = class_exists(\App\Modules\Results\Models\ManualScoreReview::class) ? \App\Modules\Results\Models\ManualScoreReview::where('organization_id', $orgId)->where('review_status', 'COMPLETED')->count() : 0;
                $data['average_score_awarded'] = 75; // Mocked for now
                break;

            case 'CANDIDATE':
                $data['pending_assessments'] = 0;
                $data['completed_assessments'] = 0;
                $data['certificates_earned'] = 0;
                $data['upcoming_sessions'] = [];

                if (class_exists(\App\Modules\Results\Models\AssessmentResult::class)) {
                    $data['completed_assessments'] = \App\Modules\Results\Models\AssessmentResult::where('candidate_id', $user->id)->count();
                }

                // Upcoming scheduled sessions for this candidate
                if (class_exists(\App\Modules\Delivery\Models\AssessmentSession::class)) {
                    $sessions = \App\Modules\Delivery\Models\AssessmentSession::where('candidate_id', $user->id)
                        ->whereIn('status', ['SCHEDULED', 'IN_PROGRESS'])
                        ->with('assessment')
                        ->orderBy('scheduled_at')
                        ->limit(5)
                        ->get();

                    $data['pending_assessments'] = $sessions->count();
                    $data['upcoming_sessions'] = $sessions->map(function ($s) {
                        return [
                            'assessment_name' => $s->assessment->name ?? $s->assessment->title ?? 'Assessment',
                            'scheduled_date'  => $s->scheduled_at ? $s->scheduled_at->format('d M Y, H:i') : 'TBD',
                            'status'          => $s->status,
                        ];
                    })->values()->toArray();
                } else {
                    // Mocked fallback for development
                    $data['pending_assessments'] = 2;
                    $data['completed_assessments'] = 5;
                    $data['certificates_earned'] = 1;
                    $data['upcoming_sessions'] = [
                        ['assessment_name' => 'Angular Developer Assessment', 'scheduled_date' => '05 Jul 2026, 10:00', 'status' => 'SCHEDULED'],
                        ['assessment_name' => 'Problem Solving Test',         'scheduled_date' => '08 Jul 2026, 14:00', 'status' => 'SCHEDULED'],
                    ];
                }
                break;

            case 'PROCTOR':
                $data['active_sessions'] = $tenantActiveSessions;
                $data['flagged_sessions'] = 2; // Mocked
                $data['terminated_sessions'] = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) ? \App\Modules\Delivery\Models\AssessmentAttempt::where('organization_id', $orgId)->where('status', 'TERMINATED')->count() : 0;
                break;

            case 'BILLING_ADMIN':
                $data['active_subscriptions'] = 5; // Mocked
                $data['pending_invoices'] = 2; // Mocked
                $data['organizations_count'] = $orgCount;
                break;

            case 'READ_ONLY':
                $data['organizations_count'] = $orgCount;
                $data['users_count'] = $userCount;
                $data['assessments_count'] = $assessmentCount;
                break;

            case 'SUPPORT':
                $data['users_count'] = $userCount;
                $data['active_sessions'] = $activeSessions;
                $data['open_tickets'] = 12; // Mocked
                break;
        }

        // Real chart data for Admin Dashboard (Phase 4)
        $chartData = [
            'userGrowth' => [
                'categories' => [],
                'series' => [['name' => 'Attempts Started', 'data' => []]]
            ],
            'completionRates' => [
                'categories' => [],
                'series' => [
                    ['name' => 'Completed', 'data' => []],
                    ['name' => 'Dropped', 'data' => []]
                ]
            ]
        ];

        if (class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class)) {
            $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();
            if ($driver === 'sqlite') {
                $selectMonth = "cast(strftime('%Y', created_date) as integer) as year, cast(strftime('%m', created_date) as integer) as month, count(*) as count";
                $selectWeek = "cast(strftime('%Y', created_date) as integer) as year, cast(strftime('%W', created_date) as integer) as week, status, count(*) as count";
            } else {
                $selectMonth = "YEAR(created_date) as year, MONTH(created_date) as month, count(*) as count";
                $selectWeek = "YEAR(created_date) as year, WEEK(created_date, 1) as week, status, count(*) as count";
            }

            // User Growth (Attempts over last 6 months)
            $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
            $attemptsByMonth = \App\Modules\Delivery\Models\AssessmentAttempt::where('created_date', '>=', $sixMonthsAgo)
                ->selectRaw($selectMonth)
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();
            
            $months = [];
            $counts = [];
            for ($i = 0; $i < 6; $i++) {
                $date = now()->subMonths(5 - $i);
                $year = (int)$date->format('Y');
                $month = (int)$date->format('n');
                
                $match = $attemptsByMonth->first(function($item) use ($year, $month) {
                    return (int)$item->year === $year && (int)$item->month === $month;
                });
                
                $months[] = $date->format('M');
                $counts[] = $match ? $match->count : 0;
            }
            $chartData['userGrowth']['categories'] = $months;
            $chartData['userGrowth']['series'][0]['data'] = $counts;

            // Completion Rates (Last 4 weeks)
            $fourWeeksAgo = now()->subWeeks(3)->startOfWeek();
            $attemptsByWeek = \App\Modules\Delivery\Models\AssessmentAttempt::where('created_date', '>=', $fourWeeksAgo)
                ->selectRaw($selectWeek)
                ->groupBy('year', 'week', 'status')
                ->orderBy('year')
                ->orderBy('week')
                ->get();

            $weeks = [];
            $completed = [];
            $dropped = [];
            for ($i = 0; $i < 4; $i++) {
                $date = now()->subWeeks(3 - $i);
                $year = (int)$date->format('Y');
                $week = (int)$date->format('W');
                
                $matches = $attemptsByWeek->filter(function($item) use ($year, $week) {
                    return (int)$item->year === $year && (int)$item->week === $week;
                });
                
                $weeks[] = 'Week ' . ($i + 1);
                $completed[] = $matches->whereIn('status', ['COMPLETED', 'PASSED', 'FAILED'])->sum('count');
                $dropped[] = $matches->whereNotIn('status', ['COMPLETED', 'PASSED', 'FAILED'])->sum('count');
            }
            $chartData['completionRates']['categories'] = $weeks;
            $chartData['completionRates']['series'][0]['data'] = $completed;
            $chartData['completionRates']['series'][1]['data'] = $dropped;
        }

        $data['charts'] = $chartData;

        return response()->json([
            'success' => true,
            'message' => 'Dashboard summary retrieved successfully',
            'data' => $data
        ]);
    }
}
