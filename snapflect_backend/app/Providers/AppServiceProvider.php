<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Auto-bind repositories
        $modulesPath = app_path('Modules');
        if (file_exists($modulesPath)) {
            $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($modulesPath));
            foreach ($iterator as $file) {
                if ($file->isFile() && str_ends_with($file->getFilename(), 'Repository.php')) {
                    $className = 'App\\Modules\\' . str_replace(DIRECTORY_SEPARATOR, '\\', substr($file->getPathname(), strlen($modulesPath) + 1, -4));
                    if (str_contains($className, '\\Eloquent\\')) {
                        $interfaceName = str_replace('\\Eloquent\\', '\\Interfaces\\', $className) . 'Interface';
                    } else {
                        $interfaceName = $className . 'Interface';
                    }
                    if (interface_exists($interfaceName) && class_exists($className)) {
                        $this->app->bind($interfaceName, $className);
                    }
                }
            }
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        \Illuminate\Support\Facades\Gate::guessPolicyNamesUsing(function ($modelClass) {
            if (str_starts_with($modelClass, 'App\\Modules\\')) {
                return str_replace('\\Models\\', '\\Policies\\', $modelClass) . 'Policy';
            }
            return 'App\\Policies\\' . class_basename($modelClass) . 'Policy';
        });
    }
}
