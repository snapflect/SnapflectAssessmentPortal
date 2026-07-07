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
        $orgCount = class_exists(\App\Modules\Governance\Models\Organization::class) ? \App\Modules\Governance\Models\Organization::where('is_deleted', false)->where('id', '!=', 1)->count() : 0;
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
                
                // Add required frontend stats
                $data['total_assessments'] = $tenantAssessmentCount;
                $data['total_attempts'] = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) 
                    ? \App\Modules\Delivery\Models\AssessmentAttempt::where('organization_id', $orgId)->where('status', 'SCORED')->count() 
                    : 0;

                // Calculate passed/failed/average based on latest result per attempt
                $latestResults = \Illuminate\Support\Facades\DB::table('assessment_results as ar1')
                    ->where('ar1.organization_id', $orgId)
                    ->where('ar1.is_deleted', 0)
                    ->whereRaw('ar1.id = (SELECT MAX(ar2.id) FROM assessment_results ar2 WHERE ar2.assessment_attempt_id = ar1.assessment_attempt_id AND ar2.is_deleted = 0)')
                    ->select('ar1.pass_fail_status', 'ar1.overall_percentage')
                    ->get();
                
                $data['total_passed'] = $latestResults->where('pass_fail_status', 'PASS')->count();
                $data['total_failed'] = $latestResults->where('pass_fail_status', 'FAIL')->count();
                $data['average_score'] = $latestResults->count() > 0 ? round($latestResults->avg('overall_percentage'), 2) : 0;
                $data['pass_rate'] = $data['total_attempts'] > 0 ? round(($data['total_passed'] / $data['total_attempts']) * 100, 2) : 0;
                break;

            case 'ASSESSMENT_MANAGER':
                $data['assessments_count'] = $tenantAssessmentCount;
                $data['active_question_banks'] = class_exists(\App\Modules\Assessment\Models\QuestionBank::class) ? \App\Modules\Assessment\Models\QuestionBank::where('organization_id', $orgId)->count() : 0;
                $data['pending_reviews'] = $tenantPendingReviews;
                $data['active_sessions'] = $tenantActiveSessions;
                
                // Add required frontend stats (same logic as CLIENT_ADMIN)
                $data['total_assessments'] = $tenantAssessmentCount;
                $data['total_attempts'] = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) 
                    ? \App\Modules\Delivery\Models\AssessmentAttempt::where('organization_id', $orgId)->where('status', 'SCORED')->count() 
                    : 0;

                // Calculate passed/failed/average based on latest result per attempt
                $latestResults = \Illuminate\Support\Facades\DB::table('assessment_results as ar1')
                    ->where('ar1.organization_id', $orgId)
                    ->where('ar1.is_deleted', 0)
                    ->whereRaw('ar1.id = (SELECT MAX(ar2.id) FROM assessment_results ar2 WHERE ar2.assessment_attempt_id = ar1.assessment_attempt_id AND ar2.is_deleted = 0)')
                    ->select('ar1.pass_fail_status', 'ar1.overall_percentage')
                    ->get();
                
                $data['total_passed'] = $latestResults->where('pass_fail_status', 'PASS')->count();
                $data['total_failed'] = $latestResults->where('pass_fail_status', 'FAIL')->count();
                $data['average_score'] = $latestResults->count() > 0 ? round($latestResults->avg('overall_percentage'), 2) : 0;
                $data['pass_rate'] = $data['total_attempts'] > 0 ? round(($data['total_passed'] / $data['total_attempts']) * 100, 2) : 0;
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
                $data['average_score_awarded'] = 82; // Mocked for now
                $data['turnaround_time'] = '24h'; // Mocked
                $data['priority_queue'] = [
                    ['uuid' => 'REV-1', 'candidate_name' => 'John Doe', 'assessment_name' => 'Software Engineering Written Exam', 'date_submitted' => now()->subHours(2)->diffForHumans(), 'status' => 'Pending'],
                    ['uuid' => 'REV-2', 'candidate_name' => 'Sarah Connor', 'assessment_name' => 'Security Fundamentals', 'date_submitted' => now()->subHours(5)->diffForHumans(), 'status' => 'Pending'],
                    ['uuid' => 'REV-3', 'candidate_name' => 'Alex Johnson', 'assessment_name' => 'UI/UX Design Challenge', 'date_submitted' => now()->subDays(1)->diffForHumans(), 'status' => 'Overdue'],
                ];
                $data['reviewer_chart'] = [
                    'categories' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    'series' => [
                        ['name' => 'Reviews Assigned', 'data' => [12, 19, 15, 22, 14, 5, 8]],
                        ['name' => 'Reviews Completed', 'data' => [10, 15, 18, 20, 12, 4, 9]]
                    ]
                ];
                break;

            case 'CANDIDATE':
                $completed = 0;
                $certificates = 0;
                $pending = 0;
                
                // Completed Assessments (Unique assessments taken)
                $completed = \Illuminate\Support\Facades\DB::table('assessment_results')
                    ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
                    ->where('assessment_results.candidate_user_id', $user->id)
                    ->distinct('assessment_attempts.assessment_id')
                    ->count('assessment_attempts.assessment_id');

                // Certificates Earned
                $certificates = \Illuminate\Support\Facades\DB::table('certificates')
                    ->join('assessment_results', 'certificates.assessment_result_id', '=', 'assessment_results.id')
                    ->where('assessment_results.candidate_user_id', $user->id)
                    ->where('certificates.status', 'ACTIVE')
                    ->where('certificates.is_deleted', false)
                    ->count();

                // Pending Assessments
                // We'll count publications assigned to this user that are active/scheduled.
                $pending = \Illuminate\Support\Facades\DB::table('publication_candidates')
                    ->join('assessment_publications', 'publication_candidates.publication_id', '=', 'assessment_publications.id')
                    ->where('publication_candidates.candidate_id', $user->id)
                    ->whereIn('assessment_publications.status', ['ACTIVE', 'SCHEDULED'])
                    ->count();

                $data['completed_assessments'] = $completed;
                $data['certificates_earned'] = $certificates;
                $data['pending_assessments'] = $pending;
                $data['upcoming_sessions'] = [];
                break;

            case 'PROCTOR':
                $data['active_sessions'] = $tenantActiveSessions;
                $data['flagged_sessions'] = 2; // Mocked
                $data['terminated_sessions'] = class_exists(\App\Modules\Delivery\Models\AssessmentAttempt::class) ? \App\Modules\Delivery\Models\AssessmentAttempt::where('organization_id', $orgId)->where('status', 'TERMINATED')->count() : 0;
                break;

            case 'BILLING_ADMIN':
                if ($orgId === 1) {
                    $data['active_subscriptions'] = class_exists(\App\Modules\Billing\Models\TenantSubscription::class) ? \App\Modules\Billing\Models\TenantSubscription::where('status', 'ACTIVE')->count() : 0;
                    $data['pending_invoices'] = class_exists(\App\Modules\Billing\Models\Invoice::class) ? \App\Modules\Billing\Models\Invoice::whereIn('status', ['DRAFT', 'OVERDUE'])->count() : 0;
                    $data['organizations_count'] = $orgCount;
                    $data['is_platform_billing_admin'] = true;
                } else {
                    $data['active_subscriptions'] = class_exists(\App\Modules\Billing\Models\TenantSubscription::class) ? \App\Modules\Billing\Models\TenantSubscription::where('organization_id', $orgId)->where('status', 'ACTIVE')->count() : 0;
                    $data['pending_invoices'] = class_exists(\App\Modules\Billing\Models\Invoice::class) ? \App\Modules\Billing\Models\Invoice::where('organization_id', $orgId)->whereIn('status', ['DRAFT', 'OVERDUE'])->count() : 0;
                    $data['is_platform_billing_admin'] = false;
                }
                break;

            case 'READ_ONLY':
                $isPlatformAdmin = in_array('PLATFORM_ADMIN', $availableRoles);
                $isPlatformWideReadOnly = $isPlatformAdmin || $orgId === 1;

                if ($isPlatformWideReadOnly) {
                    $data['organizations_count'] = $orgCount;
                    $data['users_count'] = $userCount;
                    $data['assessments_count'] = $assessmentCount;
                } else {
                    $data['organizations_count'] = 1;
                    $data['users_count'] = $tenantUserCount;
                    $data['assessments_count'] = $tenantAssessmentCount;
                }
                break;

            case 'SUPPORT':
                $isPlatformAdmin = in_array('PLATFORM_ADMIN', $availableRoles);
                $isPlatformWideSupport = $isPlatformAdmin || $orgId === 1;

                if ($isPlatformWideSupport) {
                    $data['users_count'] = $userCount;
                    $data['active_sessions'] = $activeSessions;
                    $data['open_tickets'] = class_exists(\App\Modules\Support\Models\SupportTicket::class) ? \App\Modules\Support\Models\SupportTicket::where('status', 'OPEN')->count() : 12;
                } else {
                    $data['users_count'] = $tenantUserCount;
                    $data['active_sessions'] = $tenantActiveSessions;
                    $data['open_tickets'] = class_exists(\App\Modules\Support\Models\SupportTicket::class) ? \App\Modules\Support\Models\SupportTicket::where('organization_id', $orgId)->where('status', 'OPEN')->count() : 12;
                }
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
            $queryMonth = \App\Modules\Delivery\Models\AssessmentAttempt::where('created_date', '>=', $sixMonthsAgo);
            if ($orgId !== 1) {
                $queryMonth->where('organization_id', $orgId);
            }
            $attemptsByMonth = $queryMonth->selectRaw($selectMonth)
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
            $queryWeek = \App\Modules\Delivery\Models\AssessmentAttempt::where('created_date', '>=', $fourWeeksAgo);
            if ($orgId !== 1) {
                $queryWeek->where('organization_id', $orgId);
            }
            $attemptsByWeek = $queryWeek->selectRaw($selectWeek)
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
