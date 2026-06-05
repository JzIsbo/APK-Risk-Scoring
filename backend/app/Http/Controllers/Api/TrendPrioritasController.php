<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Population;
use Illuminate\Http\Request;

class TrendPrioritasController extends Controller
{
    /**
     * Get trend prioritisation analytics datasets.
     */
    public function index(Request $request)
    {
        // Get all distinct periods in database
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

        // Trend by CO Class over periods
        $trendPrioritas = [];
        foreach (['PR-1', 'PR-2', 'PR-3'] as $class) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('co_class', $class)->where('period', $period)->count();
            }
            $trendPrioritas[$class] = $counts;
        }

        // Trend by Risk Level over periods
        $trendRisk = [];
        foreach (['Low', 'Medium', 'High'] as $level) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('risk_level', $level)->where('period', $period)->count();
            }
            $trendRisk[$level] = $counts;
        }

        // Average risk score per period
        $avgRiskScore = [];
        foreach ($periods as $period) {
            $avgRiskScore[] = round(Population::where('period', $period)->avg('risk_score') ?? 0, 2);
        }

        // Average DTI per CO class over periods
        $avgDtiByClass = [];
        foreach (['PR-1', 'PR-2', 'PR-3'] as $class) {
            $values = [];
            foreach ($periods as $period) {
                $values[] = round(Population::where('co_class', $class)->where('period', $period)->avg('dti') ?? 0, 2);
            }
            $avgDtiByClass[$class] = $values;
        }

        // CO class breakdown table
        $coBreakdown = [];
        foreach (['PR-1', 'PR-2', 'PR-3'] as $class) {
            $coBreakdown[$class] = [
                'total'  => Population::where('co_class', $class)->count(),
                'high'   => Population::where('co_class', $class)->where('risk_level', 'High')->count(),
                'medium' => Population::where('co_class', $class)->where('risk_level', 'Medium')->count(),
                'low'    => Population::where('co_class', $class)->where('risk_level', 'Low')->count(),
                'avg_score' => round(Population::where('co_class', $class)->avg('risk_score') ?? 0, 2),
                'avg_dti'   => round(Population::where('co_class', $class)->avg('dti') ?? 0, 2),
            ];
        }

        // Month-over-month growth
        $growthData = [];
        if (count($periods) >= 2) {
            $lastPeriod = end($periods);
            $prevPeriod = $periods[count($periods) - 2];
            foreach (['PR-1', 'PR-2', 'PR-3'] as $class) {
                $curr = Population::where('co_class', $class)->where('period', $lastPeriod)->count();
                $prev = Population::where('co_class', $class)->where('period', $prevPeriod)->count();
                $diff = $curr - $prev;
                $pct  = $prev > 0 ? round(($diff / $prev) * 100, 1) : 0;
                $growthData[$class] = ['curr' => $curr, 'prev' => $prev, 'diff' => $diff, 'pct' => $pct];
            }
        }

        return response()->json([
            'periods' => $periods,
            'periodLabels' => $periodLabels,
            'trendPrioritas' => $trendPrioritas,
            'trendRisk' => $trendRisk,
            'avgRiskScore' => $avgRiskScore,
            'avgDtiByClass' => $avgDtiByClass,
            'coBreakdown' => $coBreakdown,
            'growthData' => $growthData
        ]);
    }
}
