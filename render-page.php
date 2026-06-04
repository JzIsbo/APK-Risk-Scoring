<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\RiskAnalysisController;
use Illuminate\Http\Request;

// Share empty errors bag to prevent ViewException
view()->share('errors', new \Illuminate\Support\ViewErrorBag);

// Find first user
$user = User::first();
if (!$user) {
    echo "No user found in database!\n";
    exit;
}

// Log in the user
auth()->login($user);

// Create request
$request = Request::create('/risk-analysis', 'GET');

// Handle request via controller
$controller = new RiskAnalysisController();
$response = $controller->index($request);

// Render view
echo $response->render();
