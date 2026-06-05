<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $alerts = $this->generateAlerts();

        // Separate by severity
        $critical = array_values(array_filter($alerts, fn($a) => $a['severity'] === 'critical'));
        $warning  = array_values(array_filter($alerts, fn($a) => $a['severity'] === 'warning'));
        $info     = array_values(array_filter($alerts, fn($a) => $a['severity'] === 'info'));

        // Get top debtors needing attention
        $highRiskDebtors = Population::where('risk_level', 'High')
            ->orderBy('risk_score', 'desc')
            ->limit(10)
            ->get();

        // Debtors with severe payment delay (> 90 days)
        $severeDelay = Population::where('payment_delay', '>', 90)
            ->orderBy('payment_delay', 'desc')
            ->limit(10)
            ->get();

        // Debtors with very high DTI (> 70%)
        $highDti = Population::where('dti', '>', 70)
            ->orderBy('dti', 'desc')
            ->limit(10)
            ->get();

        // Statistical summary
        $totalHigh       = Population::where('risk_level', 'High')->count();
        $totalMedium     = Population::where('risk_level', 'Medium')->count();
        $totalDelay90    = Population::where('payment_delay', '>', 90)->count();
        $totalHighDti    = Population::where('dti', '>', 70)->count();
        $totalNoOrder    = Population::where('status', 'No Order')->count();

        return response()->json([
            'alerts' => $alerts,
            'critical' => $critical,
            'warning' => $warning,
            'info' => $info,
            'highRiskDebtors' => $highRiskDebtors,
            'severeDelay' => $severeDelay,
            'highDti' => $highDti,
            'stats' => [
                'totalHigh' => $totalHigh,
                'totalMedium' => $totalMedium,
                'totalDelay90' => $totalDelay90,
                'totalHighDti' => $totalHighDti,
                'totalNoOrder' => $totalNoOrder,
            ]
        ]);
    }

    private function generateAlerts(): array
    {
        $alerts = [];
        $now = now()->format('Y-m-d H:i');

        $highCount = Population::where('risk_level', 'High')->count();
        $total     = Population::count();

        if ($highCount > 0 && $total > 0) {
            $pct = round(($highCount / $total) * 100, 1);
            if ($pct >= 30) {
                $alerts[] = [
                    'id'       => 1,
                    'severity' => 'critical',
                    'icon'     => 'radiation',
                    'title'    => 'Tingkat High Risk Kritis',
                    'message'  => "{$highCount} debitur ({$pct}%) dalam kategori High Risk. Tindakan segera diperlukan.",
                    'time'     => $now,
                    'action_path' => '/risk-analysis?risk_level=High',
                    'action_label' => 'Lihat Detail',
                    'read'     => false,
                ];
            } elseif ($pct >= 15) {
                $alerts[] = [
                    'id'       => 1,
                    'severity' => 'warning',
                    'icon'     => 'triangle-exclamation',
                    'title'    => 'Peningkatan High Risk',
                    'message'  => "{$highCount} debitur ({$pct}%) dalam kategori High Risk. Perlu pemantauan lebih lanjut.",
                    'time'     => $now,
                    'action_path' => '/risk-analysis?risk_level=High',
                    'action_label' => 'Lihat Detail',
                    'read'     => false,
                ];
            }
        }

        // Severe payment delay alert
        $severeDelayCount = Population::where('payment_delay', '>', 90)->count();
        if ($severeDelayCount > 0) {
            $alerts[] = [
                'id'       => 2,
                'severity' => 'critical',
                'icon'     => 'clock',
                'title'    => 'Keterlambatan Pembayaran Ekstrem',
                'message'  => "{$severeDelayCount} debitur memiliki keterlambatan lebih dari 90 hari. Perlu eskalasi segera.",
                'time'     => $now,
                'action_path' => '/alerts',
                'action_label' => 'Lihat Debitur',
                'read'     => false,
            ];
        }

        // High DTI Alert
        $highDtiCount = Population::where('dti', '>', 70)->count();
        if ($highDtiCount > 0) {
            $alerts[] = [
                'id'       => 3,
                'severity' => 'warning',
                'icon'     => 'chart-pie',
                'title'    => 'Rasio Utang Sangat Tinggi',
                'message'  => "{$highDtiCount} debitur memiliki DTI di atas 70%. Risiko gagal bayar meningkat.",
                'time'     => $now,
                'action_path' => '/pola-bayar',
                'action_label' => 'Lihat Pola Bayar',
                'read'     => false,
            ];
        }

        // No Order alert
        $noOrderHighRisk = Population::where('status', 'No Order')->where('risk_level', 'High')->count();
        if ($noOrderHighRisk > 0) {
            $alerts[] = [
                'id'       => 4,
                'severity' => 'warning',
                'icon'     => 'ban',
                'title'    => 'High Risk dengan Status No Order',
                'message'  => "{$noOrderHighRisk} debitur High Risk berstatus No Order. Memerlukan tindak lanjut koleksi.",
                'time'     => $now,
                'action_path' => '/populasi?risk_level=High',
                'action_label' => 'Lihat Populasi',
                'read'     => false,
            ];
        }

        // PR-3 concentrations
        $pr3Count = Population::where('co_class', 'PR-3')->count();
        if ($pr3Count > 0) {
            $pr3HighRisk = Population::where('co_class', 'PR-3')->where('risk_level', 'High')->count();
            if ($pr3HighRisk > 0) {
                $alerts[] = [
                    'id'       => 5,
                    'severity' => 'warning',
                    'icon'     => 'users-slash',
                    'title'    => 'Konsentrasi Risiko PR-3',
                    'message'  => "{$pr3HighRisk} dari {$pr3Count} debitur PR-3 berisiko tinggi. Evaluasi strategi penagihan.",
                    'time'     => $now,
                    'action_path' => '/trend-prioritas',
                    'action_label' => 'Lihat Tren',
                    'read'     => false,
                ];
            }
        }

        // System info alert
        $latestPeriod = Population::max('period');
        if ($latestPeriod) {
            $alerts[] = [
                'id'       => 6,
                'severity' => 'info',
                'icon'     => 'circle-info',
                'title'    => 'Data Terbaru Dimuat',
                'message'  => "Data periode {$latestPeriod} berhasil diproses. Total " . Population::count() . " debitur terdaftar dalam sistem.",
                'time'     => $now,
                'action_path' => '/dashboard',
                'action_label' => 'Ke Dashboard',
                'read'     => false,
            ];
        }

        // Low risk info
        $lowCount = Population::where('risk_level', 'Low')->count();
        if ($lowCount > 0 && $total > 0) {
            $lowPct = round(($lowCount / $total) * 100, 1);
            $alerts[] = [
                'id'       => 7,
                'severity' => 'info',
                'icon'     => 'shield-halved',
                'title'    => 'Portofolio Low Risk Stabil',
                'message'  => "{$lowCount} debitur ({$lowPct}%) dalam kategori Low Risk. Portofolio dalam kondisi sehat.",
                'time'     => $now,
                'action_path' => '/risk-analysis?risk_level=Low',
                'action_label' => 'Lihat Detail',
                'read'     => true,
            ];
        }

        return $alerts;
    }

    public function markRead(Request $request, $id)
    {
        return response()->json(['success' => true, 'id' => $id]);
    }

    public function markAllRead(Request $request)
    {
        return response()->json(['success' => true, 'message' => 'Semua notifikasi telah ditandai sebagai terbaca.']);
    }
}
