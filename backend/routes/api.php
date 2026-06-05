<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PopulationController;
use App\Http\Controllers\Api\RiskAnalysisController;
use App\Http\Controllers\Api\TrendPrioritasController;
use App\Http\Controllers\Api\PolaBayarController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\ParameterController;
use App\Http\Controllers\Api\DataMasterController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;

// Public Auth routes
Route::post('/login', [AuthController::class, 'login']);

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/dashboard/matrix-settings', [DashboardController::class, 'updateMatrixSettings']);

    // Debtor Population
    Route::get('/populasi', [PopulationController::class, 'index']);
    Route::post('/populasi', [PopulationController::class, 'store']);
    Route::put('/populasi/{id}', [PopulationController::class, 'update']);
    Route::delete('/populasi/{id}', [PopulationController::class, 'destroy']);
    Route::post('/populasi/preview', [PopulationController::class, 'previewRisk']);
    Route::post('/populasi/recalculate', [PopulationController::class, 'recalculateAll']);
    Route::post('/populasi/import', [PopulationController::class, 'importExcel']);

    // Risk Analysis
    Route::get('/risk-analysis', [RiskAnalysisController::class, 'index']);
    Route::get('/risk-analysis/{id}', [RiskAnalysisController::class, 'show']);

    // Trend Prioritas & Pola Bayar
    Route::get('/trend-prioritas', [TrendPrioritasController::class, 'index']);
    Route::get('/pola-bayar', [PolaBayarController::class, 'index']);

    // Alerts & Notifications
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts/{id}/mark-read', [AlertController::class, 'markRead']);
    Route::post('/alerts/mark-all-read', [AlertController::class, 'markAllRead']);

    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::get('/laporan/export', [LaporanController::class, 'export']);
    Route::get('/laporan/pdf-data', [LaporanController::class, 'getPdfData']);

    // Configuration / Parameters (Admin only)
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
        Route::get('/parameter', [ParameterController::class, 'index']);
        Route::post('/parameter', [ParameterController::class, 'update']);

        Route::get('/data-master', [DataMasterController::class, 'index']);
        Route::post('/data-master/co-class', [DataMasterController::class, 'storeCoClass']);
        Route::post('/data-master/payment-pattern', [DataMasterController::class, 'storePaymentPattern']);
        Route::post('/data-master/ps-ambc', [DataMasterController::class, 'storePsAmbc']);
        Route::post('/data-master/status', [DataMasterController::class, 'storeStatus']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);
    });
});
