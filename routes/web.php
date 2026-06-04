<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PopulationController;
use App\Http\Controllers\ParameterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\RiskAnalysisController;
use App\Http\Controllers\TrendPrioritasController;
use App\Http\Controllers\PolaBayarController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\DataMasterController;

// Root route: Show welcome page if guest, redirect to dashboard if authenticated
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return view('welcome');
})->name('welcome');

// Welcome page alias
Route::get('/welcome', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return view('welcome');
});

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/matrix-settings', [DashboardController::class, 'updateMatrixSettings'])->name('dashboard.update-matrix');

    // Debtor Population Management
    Route::get('/populasi', [PopulationController::class, 'index'])->name('populasi.index');
    Route::post('/populasi', [PopulationController::class, 'store'])->name('populasi.store');
    Route::put('/populasi/{population}', [PopulationController::class, 'update'])->name('populasi.update');
    Route::delete('/populasi/{population}', [PopulationController::class, 'destroy'])->name('populasi.destroy');
    Route::post('/populasi/preview', [PopulationController::class, 'previewRisk'])->name('populasi.preview');
    Route::post('/populasi/recalculate', [PopulationController::class, 'recalculateAll'])->name('populasi.recalculate');
    Route::post('/populasi/import', [PopulationController::class, 'importExcel'])->name('populasi.import');

    // Risk Analysis
    Route::get('/risk-analysis', [RiskAnalysisController::class, 'index'])->name('risk-analysis.index');
    Route::get('/risk-analysis/{population}', [RiskAnalysisController::class, 'show'])->name('risk-analysis.show');

    // Trend Prioritas
    Route::get('/trend-prioritas', [TrendPrioritasController::class, 'index'])->name('trend-prioritas.index');

    // Pola Bayar
    Route::get('/pola-bayar', [PolaBayarController::class, 'index'])->name('pola-bayar.index');

    // Alert & Notifikasi
    Route::get('/alerts', [AlertController::class, 'index'])->name('alerts.index');
    Route::post('/alerts/{id}/mark-read', [AlertController::class, 'markRead'])->name('alerts.mark-read');
    Route::post('/alerts/mark-all-read', [AlertController::class, 'markAllRead'])->name('alerts.mark-all-read');

    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/export', [LaporanController::class, 'export'])->name('laporan.export');
    Route::get('/laporan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.export-pdf');

    // Risk Parameters Configuration (restricted to admin in controller)
    Route::get('/parameter', [ParameterController::class, 'index'])->name('parameter.index');
    Route::post('/parameter', [ParameterController::class, 'update'])->name('parameter.update');

    // Data Master
    Route::get('/data-master', [DataMasterController::class, 'index'])->name('data-master.index');
    Route::post('/data-master/co-class', [DataMasterController::class, 'storeCoClass'])->name('data-master.store-co-class');
    Route::post('/data-master/payment-pattern', [DataMasterController::class, 'storePaymentPattern'])->name('data-master.store-payment-pattern');
    Route::post('/data-master/ps-ambc', [DataMasterController::class, 'storePsAmbc'])->name('data-master.store-ps-ambc');
    Route::post('/data-master/status', [DataMasterController::class, 'storeStatus'])->name('data-master.store-status');

    // User Management (admin only)
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Settings (admin only)
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
});
