<?php

namespace App\Modules\Governance\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Modules\Governance\Jobs\ProcessBulkOnboarding;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BulkOnboardingController extends Controller
{
    /**
     * Upload and initiate processing of bulk onboarding CSV.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        
        // Ensure tenant context exists (handled by Tenancy middleware)
        $tenantId = tenant('id');
        if (!$tenantId) {
            return response()->json(['error' => 'No active tenant context.'], 403);
        }

        // Store file securely in tenant's storage path
        $path = $file->storeAs('onboarding', Str::random(40) . '.csv', 'local');

        // Dispatch Job
        ProcessBulkOnboarding::dispatch($tenantId, $path);

        return response()->json([
            'message' => 'Bulk onboarding started successfully.',
            'path' => $path
        ], 202);
    }
}
