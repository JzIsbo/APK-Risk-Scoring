<?php

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

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/dashboard/matrix-settings', [DashboardController::class, 'updateMatrixSettings']);

    // Debtor Population Management
    Route::get('/populasi', [PopulationController::class, 'index']);
    Route::post('/populasi', [PopulationController::class, 'store']);
    Route::put('/populasi/{population}', [PopulationController::class, 'update']);
    Route::delete('/populasi/{population}', [PopulationController::class, 'destroy']);
    Route::post('/populasi/preview', [PopulationController::class, 'previewRisk']);
    Route::post('/populasi/recalculate', [PopulationController::class, 'recalculateAll']);
    Route::post('/populasi/import', [PopulationController::class, 'importExcel']);

    // Risk Analysis
    Route::get('/risk-analysis', [RiskAnalysisController::class, 'index']);
    Route::get('/risk-analysis/{population}', [RiskAnalysisController::class, 'show']);

    // Trend Prioritas
    Route::get('/trend-prioritas', [TrendPrioritasController::class, 'index']);

    // Pola Bayar
    Route::get('/pola-bayar', [PolaBayarController::class, 'index']);

    // Alert & Notifikasi
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts/{id}/mark-read', [AlertController::class, 'markRead']);
    Route::post('/alerts/mark-all-read', [AlertController::class, 'markAllRead']);

    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::get('/laporan/export', [LaporanController::class, 'export']);

    // Risk Parameters Configuration
    Route::get('/parameter', [ParameterController::class, 'index']);
    Route::post('/parameter', [ParameterController::class, 'update']);

    // Data Master
    Route::get('/data-master', [DataMasterController::class, 'index']);
    Route::post('/data-master/co-class', [DataMasterController::class, 'storeCoClass']);
    Route::post('/data-master/payment-pattern', [DataMasterController::class, 'storePaymentPattern']);
    Route::post('/data-master/ps-ambc', [DataMasterController::class, 'storePsAmbc']);
    Route::post('/data-master/status', [DataMasterController::class, 'storeStatus']);

    // User Management (admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Settings (admin only)
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
});
