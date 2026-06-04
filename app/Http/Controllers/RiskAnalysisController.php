<?php

namespace App\Http\Controllers;

use App\Models\Population;
use App\Models\RiskParameter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RiskAnalysisController extends Controller
{
    public function index(Request $request)
    {
        $query = Population::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('co_class', 'like', "%{$search}%");
            });
        }

        if ($request->filled('risk_level')) {
            $query->where('risk_level', $request->risk_level);
        }

        if ($request->filled('co_class')) {
            $query->where('co_class', $request->co_class);
        }

        // Sort by risk_score descending to show highest risk first
        $populations = $query->orderBy('risk_score', 'desc')->paginate(15)->withQueryString();

        // Aggregate stats per risk level
        $stats = [
            'high'   => Population::where('risk_level', 'High')->count(),
            'medium' => Population::where('risk_level', 'Medium')->count(),
            'low'    => Population::where('risk_level', 'Low')->count(),
            'total'  => Population::count(),
            'avg_score' => round(Population::avg('risk_score') ?? 0, 2),
            'avg_dti'   => round(Population::avg('dti') ?? 0, 2),
            'avg_delay' => round(Population::avg('payment_delay') ?? 0, 1),
        ];

        // Risk distribution by CO class — prepared as simple array for Chart.js
        $riskByCoRaw = Population::select('co_class', 'risk_level', DB::raw('count(*) as total'))
            ->groupBy('co_class', 'risk_level')
            ->get();

        $riskByCo = [];
        foreach ($riskByCoRaw as $row) {
            $riskByCo[$row->co_class][$row->risk_level] = $row->total;
        }

        // Top 10 highest risk debtors
        $topRisk = Population::orderBy('risk_score', 'desc')->limit(10)->get();

        // Risk parameters for reference
        $parameters = RiskParameter::all();

        return view('risk-analysis', compact('populations', 'stats', 'riskByCo', 'topRisk', 'parameters'));
    }

    public function show(Population $population)
    {
        $parameters = RiskParameter::all();

        // Build detailed breakdown per parameter
        $breakdown = [];
        foreach ($parameters as $param) {
            $value = $population->getAttribute($param->key);
            $matchingScore = 0;
            $matchingLabel = 'N/A';
            foreach ($param->criteria ?? [] as $rule) {
                $min = isset($rule['min']) ? floatval($rule['min']) : -999999;
                $max = isset($rule['max']) ? floatval($rule['max']) : 999999;
                $score = isset($rule['score']) ? floatval($rule['score']) : 0;
                if ($value !== null && $value >= $min && $value <= $max) {
                    $matchingScore = $score;
                    $matchingLabel = isset($rule['label']) ? $rule['label'] : "Score {$score}";
                    break;
                }
            }
            $contribution = $matchingScore * ($param->weight / 100);
            $breakdown[] = [
                'name'        => $param->name,
                'key'         => $param->key,
                'weight'      => $param->weight,
                'value'       => $value,
                'score'       => $matchingScore,
                'label'       => $matchingLabel,
                'contribution'=> round($contribution, 2),
            ];
        }

        // Similar risk debtors (same risk level, different debtor)
        $similar = Population::where('risk_level', $population->risk_level)
            ->where('id', '!=', $population->id)
            ->orderBy('risk_score', 'desc')
            ->limit(5)
            ->get();

        return view('risk-analysis-detail', compact('population', 'breakdown', 'similar', 'parameters'));
    }
}
