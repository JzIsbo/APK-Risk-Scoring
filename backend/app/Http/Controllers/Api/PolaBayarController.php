<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PolaBayarController extends Controller
{
    /**
     * Get payment patterns and PS AMBC analytics datasets.
     */
    public function index(Request $request)
    {
        $periods = Population::select('period')
            ->distinct()
            ->orderBy('period', 'asc')
            ->pluck('period')
            ->toArray();

        if (empty($periods)) {
            $periods = ['2026-01', '2026-02', '2026-03', '2026-04'];
        }

        $periodLabels = array_map(function($p) {
            $parts = explode('-', $p);
            $months = ['01'=>'JAN','02'=>'FEB','03'=>'MAR','04'=>'APR','05'=>'MEI','06'=>'JUN',
                       '07'=>'JUL','08'=>'AGU','09'=>'SEP','10'=>'OKT','11'=>'NOV','12'=>'DES'];
            return ($months[$parts[1]] ?? $parts[1]) . ' ' . $parts[0];
        }, $periods);

        // Pola Bayar trend by period
        $polaBayarData = [];
        foreach (['L3', 'L4', 'L5'] as $pattern) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('payment_pattern', $pattern)->where('period', $period)->count();
            }
            $polaBayarData[$pattern] = $counts;
        }

        // PS AMBC trend by period
        $psAmbcData = [];
        foreach (['PS-1', 'PS-2', 'PS-3', 'PS-4'] as $ambc) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('ps_ambc', $ambc)->where('period', $period)->count();
            }
            $psAmbcData[$ambc] = $counts;
        }

        // Payment delay trend (average)
        $avgDelayPerPeriod = [];
        foreach ($periods as $period) {
            $avgDelayPerPeriod[] = round(Population::where('period', $period)->avg('payment_delay') ?? 0, 1);
        }

        // Payment pattern distribution summary
        $patternSummary = [];
        foreach (['L3', 'L4', 'L5'] as $pattern) {
            $total = Population::where('payment_pattern', $pattern)->count();
            $highRisk = Population::where('payment_pattern', $pattern)->where('risk_level', 'High')->count();
            $avgScore = round(Population::where('payment_pattern', $pattern)->avg('risk_score') ?? 0, 2);
            $avgDelay = round(Population::where('payment_pattern', $pattern)->avg('payment_delay') ?? 0, 1);
            $patternSummary[$pattern] = [
                'total' => $total,
                'high_risk' => $highRisk,
                'avg_score' => $avgScore,
                'avg_delay' => $avgDelay,
            ];
        }

        // PS AMBC summary
        $psAmbcSummary = [];
        foreach (['PS-1', 'PS-2', 'PS-3', 'PS-4'] as $ambc) {
            $total = Population::where('ps_ambc', $ambc)->count();
            $highRisk = Population::where('ps_ambc', $ambc)->where('risk_level', 'High')->count();
            $avgScore = round(Population::where('ps_ambc', $ambc)->avg('risk_score') ?? 0, 2);
            $psAmbcSummary[$ambc] = [
                'total' => $total,
                'high_risk' => $highRisk,
                'avg_score' => $avgScore,
            ];
        }

        // No Order vs Settled by payment pattern
        $noOrderByPattern = [];
        foreach (['L3', 'L4', 'L5'] as $pattern) {
            $noOrderByPattern[$pattern] = [
                'no_order' => Population::where('payment_pattern', $pattern)->where('status', 'No Order')->count(),
                'active'   => Population::where('payment_pattern', $pattern)->where('status', 'Active')->count(),
                'settled'  => Population::where('payment_pattern', $pattern)->where('status', 'Settled')->count(),
            ];
        }

        // Cross-tab: payment_pattern x ps_ambc count
        $crossTabRaw = Population::select('payment_pattern', 'ps_ambc', DB::raw('count(*) as cnt'))
            ->groupBy('payment_pattern', 'ps_ambc')
            ->get();
            
        $crossTab = [];
        foreach ($crossTabRaw as $row) {
            $crossTab[$row->payment_pattern][$row->ps_ambc] = $row->cnt;
        }

        return response()->json([
            'periods' => $periods,
            'periodLabels' => $periodLabels,
            'polaBayarData' => $polaBayarData,
            'psAmbcData' => $psAmbcData,
            'avgDelayPerPeriod' => $avgDelayPerPeriod,
            'patternSummary' => $patternSummary,
            'psAmbcSummary' => $psAmbcSummary,
            'noOrderByPattern' => $noOrderByPattern,
            'crossTab' => $crossTab
        ]);
    }
}
