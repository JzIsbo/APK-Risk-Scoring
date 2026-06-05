<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Calculate KPI Metrics
        $totalPopulation = Population::count();
        $riskPopulation = Population::whereIn('risk_level', ['Medium', 'High'])->count();
        $highRisk = Population::where('risk_level', 'High')->count();
        $lowRisk = Population::where('risk_level', 'Low')->count();
        $noOrder = Population::where('status', 'No Order')->count();

        // Dynamic periods
        $periods = Population::select('period')
            ->whereNotNull('period')
            ->where('period', '!=', '')
            ->distinct()
            ->orderBy('period', 'asc')
            ->pluck('period')
            ->toArray();

        if (empty($periods)) {
            $periods = ['2026-01', '2026-02', '2026-03', '2026-04'];
        } else {
            $periods = array_slice($periods, -6);
        }

        // Dynamic CO classes
        $coClasses = Population::select('co_class')
            ->whereNotNull('co_class')
            ->where('co_class', '!=', '')
            ->distinct()
            ->orderBy('co_class', 'asc')
            ->pluck('co_class')
            ->toArray();

        if (empty($coClasses)) {
            $coClasses = ['PR-1', 'PR-2', 'PR-3'];
        }

        // Dynamic KPI Changes (Latest vs Previous Period)
        $latestPeriod = Population::max('period');
        $prevPeriod = null;
        if ($latestPeriod) {
            $prevPeriod = Population::where('period', '<', $latestPeriod)->max('period');
        }

        $changes = [
            'total' => ['val' => 0, 'dir' => 'up'],
            'risk'  => ['val' => 0, 'dir' => 'up'],
            'high'  => ['val' => 0, 'dir' => 'up'],
            'low'   => ['val' => 0, 'dir' => 'up'],
            'no_order' => ['val' => 0, 'dir' => 'up'],
            'compare_label' => 'vs Periode Sebelumnya'
        ];

        if ($latestPeriod && $prevPeriod) {
            $changes['compare_label'] = 'vs ' . $prevPeriod;

            $latestTotal = Population::where('period', $latestPeriod)->count();
            $prevTotal   = Population::where('period', $prevPeriod)->count();
            $changes['total'] = $this->calculatePctChange($latestTotal, $prevTotal);

            $latestRisk = Population::where('period', $latestPeriod)->whereIn('risk_level', ['Medium', 'High'])->count();
            $prevRisk   = Population::where('period', $prevPeriod)->whereIn('risk_level', ['Medium', 'High'])->count();
            $changes['risk'] = $this->calculatePctChange($latestRisk, $prevRisk);

            $latestHigh = Population::where('period', $latestPeriod)->where('risk_level', 'High')->count();
            $prevHigh   = Population::where('period', $prevPeriod)->where('risk_level', 'High')->count();
            $changes['high'] = $this->calculatePctChange($latestHigh, $prevHigh);

            $latestLow = Population::where('period', $latestPeriod)->where('risk_level', 'Low')->count();
            $prevLow   = Population::where('period', $prevPeriod)->where('risk_level', 'Low')->count();
            $changes['low'] = $this->calculatePctChange($latestLow, $prevLow);

            $latestNoOrder = Population::where('period', $latestPeriod)->where('status', 'No Order')->count();
            $prevNoOrder   = Population::where('period', $prevPeriod)->where('status', 'No Order')->count();
            $changes['no_order'] = $this->calculatePctChange($latestNoOrder, $prevNoOrder);
        }

        // 2. Populasi CO (Doughnut Chart)
        $populasiCo = Population::select('co_class', DB::raw('count(*) as count'))
            ->whereNotNull('co_class')
            ->where('co_class', '!=', '')
            ->groupBy('co_class')
            ->pluck('count', 'co_class')
            ->toArray();
        foreach ($coClasses as $class) {
            if (!isset($populasiCo[$class])) {
                $populasiCo[$class] = 0;
            }
        }

        $colors = ['#00d2ff', '#0072ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

        // 3. Populasi Beban CO
        $bebanDatasets = [];
        $idx = 0;
        foreach ($coClasses as $class) {
            $classData = [];
            foreach ($periods as $period) {
                $avg = Population::where('co_class', $class)
                    ->where('period', $period)
                    ->avg('co_burden') ?? 0;
                $classData[] = round($avg, 2);
            }
            $color = $colors[$idx % count($colors)];
            $bebanDatasets[] = [
                'label' => $class,
                'data' => $classData,
                'backgroundColor' => $color,
                'borderRadius' => 4
            ];
            $idx++;
        }

        // 4. Populasi Risk (Radar Chart)
        $populasiRiskBreakdown = Population::whereIn('risk_level', ['Medium', 'High'])
            ->select('co_class', DB::raw('count(*) as count'))
            ->whereNotNull('co_class')
            ->where('co_class', '!=', '')
            ->groupBy('co_class')
            ->pluck('count', 'co_class')
            ->toArray();
        foreach ($coClasses as $class) {
            if (!isset($populasiRiskBreakdown[$class])) {
                $populasiRiskBreakdown[$class] = 0;
            }
        }

        // 5. Trend Prioritas
        $trendDatasets = [];
        $idx = 0;
        foreach ($coClasses as $class) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('co_class', $class)
                    ->where('period', $period)
                    ->count();
            }
            $color = $colors[$idx % count($colors)];
            $trendDatasets[] = [
                'label' => $class,
                'data' => $counts,
                'borderColor' => $color,
                'backgroundColor' => 'rgba(' . hexdec(substr($color, 1, 2)) . ',' . hexdec(substr($color, 3, 2)) . ',' . hexdec(substr($color, 5, 2)) . ', 0.05)',
                'tension' => 0.4,
                'borderWidth' => 2
            ];
            $idx++;
        }

        // 6. Pola Bayar Akhir
        $patterns = Population::select('payment_pattern')
            ->whereNotNull('payment_pattern')
            ->where('payment_pattern', '!=', '')
            ->distinct()
            ->orderBy('payment_pattern', 'asc')
            ->pluck('payment_pattern')
            ->toArray();
        if (empty($patterns)) {
            $patterns = ['L3', 'L4', 'L5'];
        }

        $polaDatasets = [];
        $idx = 0;
        foreach ($patterns as $pattern) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('payment_pattern', $pattern)
                    ->where('period', $period)
                    ->count();
            }
            $color = $colors[$idx % count($colors)];
            $polaDatasets[] = [
                'label' => $pattern,
                'data' => $counts,
                'borderColor' => $color,
                'tension' => 0.3,
                'borderWidth' => 2
            ];
            $idx++;
        }

        // 7. PS AMBC (SELESAI)
        $ambcs = Population::select('ps_ambc')
            ->whereNotNull('ps_ambc')
            ->where('ps_ambc', '!=', '')
            ->distinct()
            ->orderBy('ps_ambc', 'asc')
            ->pluck('ps_ambc')
            ->toArray();
        if (empty($ambcs)) {
            $ambcs = ['PS-1', 'PS-2', 'PS-3', 'PS-4'];
        }

        $psDatasets = [];
        $idx = 0;
        foreach ($ambcs as $ambc) {
            $counts = [];
            foreach ($periods as $period) {
                $counts[] = Population::where('ps_ambc', $ambc)
                    ->where('period', $period)
                    ->count();
            }
            $color = $colors[$idx % count($colors)];
            $psDatasets[] = [
                'label' => $ambc,
                'data' => $counts,
                'borderColor' => $color,
                'tension' => 0.4,
                'borderWidth' => 2
            ];
            $idx++;
        }

        // 8. Populasi Risk - No Order
        $riskNoOrder = [
            'No Order' => [
                'Low' => Population::where('status', 'No Order')->where('risk_level', 'Low')->count(),
                'Medium' => Population::where('status', 'No Order')->where('risk_level', 'Medium')->count(),
                'High' => Population::where('status', 'No Order')->where('risk_level', 'High')->count(),
            ],
            'Selesai' => [
                'Low' => Population::where('status', '!=', 'No Order')->where('risk_level', 'Low')->count(),
                'Medium' => Population::where('status', '!=', 'No Order')->where('risk_level', 'Medium')->count(),
                'High' => Population::where('status', '!=', 'No Order')->where('risk_level', 'High')->count(),
            ]
        ];

        // 9. Matrix Diagram Calculation
        $matrixX = $request->input('matrix_x_param') ?? \App\Models\Setting::where('key', 'matrix_x_param')->value('value') ?? 'payment_delay';
        $matrixY = $request->input('matrix_y_param') ?? \App\Models\Setting::where('key', 'matrix_y_param')->value('value') ?? 'dti';
        $matrixData = $this->getMatrixData($matrixX, $matrixY);

        return response()->json([
            'totalPopulation' => $totalPopulation,
            'riskPopulation' => $riskPopulation,
            'highRisk' => $highRisk,
            'lowRisk' => $lowRisk,
            'noOrder' => $noOrder,
            'populasiCo' => $populasiCo,
            'bebanDatasets' => $bebanDatasets,
            'populasiRiskBreakdown' => $populasiRiskBreakdown,
            'trendDatasets' => $trendDatasets,
            'polaDatasets' => $polaDatasets,
            'psDatasets' => $psDatasets,
            'riskNoOrder' => $riskNoOrder,
            'periods' => $periods,
            'changes' => $changes,
            'matrixX' => $matrixX,
            'matrixY' => $matrixY,
            'matrixData' => $matrixData
        ]);
    }

    public function updateMatrixSettings(Request $request)
    {
        $request->validate([
            'matrix_x_param' => 'required|string|in:dti,payment_delay,credit_score,age,co_burden',
            'matrix_y_param' => 'required|string|in:dti,payment_delay,credit_score,age,co_burden',
        ]);

        if ($request->has('save_as_default') && $request->user()->role === 'admin') {
            \App\Models\Setting::updateOrCreate(['key' => 'matrix_x_param'], ['value' => $request->matrix_x_param]);
            \App\Models\Setting::updateOrCreate(['key' => 'matrix_y_param'], ['value' => $request->matrix_y_param]);
        }

        return response()->json([
            'message' => 'Pengaturan diagram matriks berhasil disimpan!',
            'matrixX' => $request->matrix_x_param,
            'matrixY' => $request->matrix_y_param,
        ]);
    }

    private function getMatrixData($paramX, $paramY)
    {
        $parameterX = \App\Models\RiskParameter::where('key', $paramX)->first();
        $parameterY = \App\Models\RiskParameter::where('key', $paramY)->first();

        $levelsY = ['High', 'Medium', 'Low'];
        $levelsX = ['Low', 'Medium', 'High'];

        $grid = [];
        foreach ($levelsY as $yLvl) {
            foreach ($levelsX as $xLvl) {
                $grid[$yLvl][$xLvl] = 0;
            }
        }

        if (!$parameterX || !$parameterY) {
            return [
                'grid' => $grid,
                'nameX' => $paramX,
                'nameY' => $paramY,
                'levelsY' => $levelsY,
                'levelsX' => $levelsX
            ];
        }

        $populations = Population::all();
        foreach ($populations as $pop) {
            $valX = $pop->getAttribute($paramX);
            $valY = $pop->getAttribute($paramY);

            $lvlX = $this->determineLevel($valX, $parameterX->criteria);
            $lvlY = $this->determineLevel($valY, $parameterY->criteria);

            if (isset($grid[$lvlY][$lvlX])) {
                $grid[$lvlY][$lvlX]++;
            }
        }

        return [
            'grid' => $grid,
            'nameX' => $parameterX->name,
            'nameY' => $parameterY->name,
            'levelsY' => $levelsY,
            'levelsX' => $levelsX
        ];
    }

    private function determineLevel($value, $criteria)
    {
        if ($value === null) {
            return 'Low';
        }

        foreach ($criteria ?? [] as $rule) {
            $min = isset($rule['min']) ? floatval($rule['min']) : -999999;
            $max = isset($rule['max']) ? floatval($rule['max']) : 999999;
            $level = $rule['level'] ?? 'Low';

            if ($value >= $min && $value <= $max) {
                return $level;
            }
        }

        return 'Low';
    }

    private function calculatePctChange($latest, $prev)
    {
        if ($prev <= 0) {
            return ['val' => 0, 'dir' => 'up'];
        }
        $pct = round((($latest - $prev) / $prev) * 100, 1);
        return [
            'val' => abs($pct),
            'dir' => $pct >= 0 ? 'up' : 'down'
        ];
    }
}
