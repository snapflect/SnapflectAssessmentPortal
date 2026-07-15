<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \Illuminate\Support\Facades\Mail::raw('Testing SSL bypass with DSN URL', function($msg) {
        $msg->to('csemubarak@gmail.com')->subject('Testing SSL Bypass');
    });
    echo "Mail sent successfully with DSN!\n";
} catch (\Exception $e) {
    echo "Mail failed: " . $e->getMessage() . "\n";
}
