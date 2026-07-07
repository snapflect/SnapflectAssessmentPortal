<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Modules\Billing\Models\SubscriptionPlan;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'plan_code' => 'DEMO_14',
                'plan_name' => '14-Day Free Demo',
                'description' => 'Full access trial for 14 days.',
                'price' => 0.00,
                'billing_interval' => 'DAYS',
                'interval_count' => 14,
                'included_assessments' => 50,
            ],
            [
                'plan_code' => 'BASIC_1M',
                'plan_name' => 'Monthly Basic',
                'description' => 'Basic monthly plan for small teams.',
                'price' => 2000.00, // INR
                'billing_interval' => 'MONTHS',
                'interval_count' => 1,
                'included_assessments' => 500,
            ],
            [
                'plan_code' => 'PRO_3M',
                'plan_name' => '3-Month Pro',
                'description' => 'Quarterly professional plan.',
                'price' => 5500.00, // INR
                'billing_interval' => 'MONTHS',
                'interval_count' => 3,
                'included_assessments' => 2000,
            ],
            [
                'plan_code' => 'PRO_6M',
                'plan_name' => '6-Month Pro',
                'description' => 'Half-yearly professional plan.',
                'price' => 10000.00, // INR
                'billing_interval' => 'MONTHS',
                'interval_count' => 6,
                'included_assessments' => 5000,
            ],
            [
                'plan_code' => 'ENTERPRISE_12M',
                'plan_name' => 'Enterprise Annual',
                'description' => 'Unlimited annual enterprise access.',
                'price' => 18000.00, // INR
                'billing_interval' => 'YEARS',
                'interval_count' => 1,
                'included_assessments' => 100000, // Practically unlimited
            ],
        ];

        foreach ($plans as $plan) {
            $existing = SubscriptionPlan::where('plan_code', $plan['plan_code'])->first();
            if (!$existing) {
                SubscriptionPlan::create(array_merge($plan, [
                    'uuid' => Str::uuid(),
                    'created_by' => 1,
                    'created_date' => now(),
                ]));
            }
        }
    }
}
