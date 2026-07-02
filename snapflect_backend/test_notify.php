<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(1);
$user->notify(new App\Notifications\ResultPublishedNotification('Mock Assessment', 'mock-uuid-1234'));
echo "Notification created successfully.\n";
