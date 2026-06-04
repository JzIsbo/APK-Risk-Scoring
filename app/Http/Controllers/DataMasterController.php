<?php

namespace App\Http\Controllers;

use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DataMasterController extends Controller
{
    private $coClasses      = ['PR-1', 'PR-2', 'PR-3'];
    private $paymentPatterns = ['L3', 'L4', 'L5'];
    private $psAmbcClasses  = ['PS-1', 'PS-2', 'PS-3', 'PS-4'];
    private $statuses       = ['No Order', 'Active', 'Settled'];

    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.');
        }

        $coClasses = $this->coClasses;
        $paymentPatterns = $this->paymentPatterns;
        $psAmbcClasses = $this->psAmbcClasses;
        $statuses = $this->statuses;

        // Stats for each master data item
        $coStats = [];
        foreach ($coClasses as $class) {
            $coStats[$class] = [
                'total'     => Population::where('co_class', $class)->count(),
                'high'      => Population::where('co_class', $class)->where('risk_level', 'High')->count(),
                'avg_score' => round(Population::where('co_class', $class)->avg('risk_score') ?? 0, 2),
            ];
        }

        $patternStats = [];
        foreach ($paymentPatterns as $pattern) {
            $patternStats[$pattern] = [
                'total'      => Population::where('payment_pattern', $pattern)->count(),
                'high'       => Population::where('payment_pattern', $pattern)->where('risk_level', 'High')->count(),
                'avg_delay'  => round(Population::where('payment_pattern', $pattern)->avg('payment_delay') ?? 0, 1),
            ];
        }

        $psStats = [];
        foreach ($psAmbcClasses as $ps) {
            $psStats[$ps] = [
                'total'     => Population::where('ps_ambc', $ps)->count(),
                'high'      => Population::where('ps_ambc', $ps)->where('risk_level', 'High')->count(),
                'avg_score' => round(Population::where('ps_ambc', $ps)->avg('risk_score') ?? 0, 2),
            ];
        }

        $statusStats = [];
        foreach ($statuses as $status) {
            $statusStats[$status] = [
                'total'     => Population::where('status', $status)->count(),
                'high'      => Population::where('status', $status)->where('risk_level', 'High')->count(),
                'avg_score' => round(Population::where('status', $status)->avg('risk_score') ?? 0, 2),
            ];
        }

        // Period stats
        $periodStats = Population::select('period', DB::raw('count(*) as total'),
                DB::raw('sum(case when risk_level = "High" then 1 else 0 end) as high_count'),
                DB::raw('avg(risk_score) as avg_score'))
            ->groupBy('period')
            ->orderBy('period', 'desc')
            ->get();

        return view('data-master', compact(
            'coClasses', 'paymentPatterns', 'psAmbcClasses', 'statuses',
            'coStats', 'patternStats', 'psStats', 'statusStats', 'periodStats'
        ));
    }

    public function storeCoClass(Request $request)
    {
        if (auth()->user()->role !== 'admin') abort(403);
        $request->validate(['name' => 'required|string|max:20']);
        return redirect()->route('data-master.index')->with('success', "Kelas CO '{$request->name}' telah ditambahkan ke sistem.");
    }

    public function storePaymentPattern(Request $request)
    {
        if (auth()->user()->role !== 'admin') abort(403);
        $request->validate(['name' => 'required|string|max:20']);
        return redirect()->route('data-master.index')->with('success', "Pola Bayar '{$request->name}' telah ditambahkan ke sistem.");
    }

    public function storePsAmbc(Request $request)
    {
        if (auth()->user()->role !== 'admin') abort(403);
        $request->validate(['name' => 'required|string|max:20']);
        return redirect()->route('data-master.index')->with('success', "PS AMBC '{$request->name}' telah ditambahkan ke sistem.");
    }

    public function storeStatus(Request $request)
    {
        if (auth()->user()->role !== 'admin') abort(403);
        $request->validate(['name' => 'required|string|max:50']);
        return redirect()->route('data-master.index')->with('success', "Status '{$request->name}' telah ditambahkan ke sistem.");
    }
}
