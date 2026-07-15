<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = \Illuminate\Http\Request::create('/api/v1/auth/forgot-password', 'POST', [
    'email' => 'official@snapflect.com'
]);

$controller = $app->make(\App\Modules\Security\Controllers\AuthController::class);
$response = $controller->forgotPassword($request);

echo "Forgot Password Response:\n";
echo $response->getContent();
echo "\n\n";

// Get user to see if token was created
$user = \App\Modules\Security\Models\User::where('email', 'official@snapflect.com')->first();
$tokens = \DB::table('password_reset_tokens')->where('email', $user->email)->first();
echo "Token created for user:\n";
print_r($tokens);

if ($tokens) {
    echo "\n\nSimulating Reset Password:\n";
    $request2 = \Illuminate\Http\Request::create('/api/v1/auth/reset-password', 'POST', [
        'email' => 'official@snapflect.com',
        'token' => 'dummy', // This won't work because tokens are hashed in DB, but we will test error handling
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!'
    ]);
    
    try {
        $response2 = $controller->resetPassword($request2);
        echo $response2->getContent();
    } catch (\Illuminate\Validation\ValidationException $e) {
        echo "Validation Exception Caught (Expected for dummy token):\n";
        print_r($e->errors());
    }
}
