<?php

/**
 * Vercel PHP Serverless Entry Point for Laravel
 *
 * Vercel mounts the project root, sehingga kita perlu
 * merekonstruksi paths yang biasanya di-handle oleh public/index.php.
 */

define('LARAVEL_START', microtime(true));

// Root project = satu level di atas folder api/
$root = __DIR__ . '/..';

// Maintenance mode check
if (file_exists($maintenance = $root . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Autoloader Composer
require $root . '/vendor/autoload.php';

// Override $_SERVER supaya Laravel membaca path dengan benar
// Vercel meneruskan REQUEST_URI dari route, tapi SCRIPT_NAME perlu disesuaikan
$_SERVER['DOCUMENT_ROOT'] = $root . '/public';

// Bootstrap Laravel dan tangani request
$app = require_once $root . '/bootstrap/app.php';

use Illuminate\Http\Request;

$app->handleRequest(Request::capture());
