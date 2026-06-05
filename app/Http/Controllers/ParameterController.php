<?php

namespace App\Http\Controllers;

use App\Models\RiskParameter;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParameterController extends Controller
{
    /**
     * Display configuration page.
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mengakses halaman ini.');
        }
        $parameters = RiskParameter::all();
        $totalWeight = $parameters->sum('weight');
        return view('parameter', compact('parameters', 'totalWeight'));
    }

    /**
     * Update parameter weights and criteria rules.
     */
    public function update(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mengakses halaman ini.');
        }
        $weights = $request->input('weights', []);
        $criteriaData = $request->input('criteria', []);

        // Validate that total weight equals 100%
        $totalWeight = array_sum($weights);
        if (abs($totalWeight - 100) > 0.01) {
            return back()->withErrors(['weight_error' => 'Total bobot parameter harus tepat berjumlah 100%. Saat ini: ' . $totalWeight . '%']);
        }

        DB::beginTransaction();
        try {
            foreach ($weights as $key => $weight) {
                $parameter = RiskParameter::where('key', $key)->first();
                if ($parameter) {
                    $updateData = ['weight' => floatval($weight)];

                    // Update criteria if provided
                    if (isset($criteriaData[$key])) {
                        $processedCriteria = [];
                        foreach ($criteriaData[$key] as $rule) {
                            $processedCriteria[] = [
                                'min' => isset($rule['min']) ? floatval($rule['min']) : 0,
                                'max' => isset($rule['max']) ? floatval($rule['max']) : 9999,
                                'score' => isset($rule['score']) ? floatval($rule['score']) : 0,
                                'level' => $rule['level'] ?? 'Low',
                            ];
                        }
                        $updateData['criteria'] = $processedCriteria;
                    }

                    $parameter->update($updateData);
                }
            }

            DB::commit();

            // Perform automatic database-wide recalculation since weights or criteria changed
            $populations = Population::all();
            foreach ($populations as $pop) {
                // Saving triggers the booted() saving observer which recalculates risk
                $pop->save();
            }

            return redirect()->route('parameter.index')->with('success', 'Parameter penilaian risiko berhasil diperbarui! Seluruh data debitur telah di-kalkulasi ulang secara otomatis.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general_error' => 'Gagal memperbarui parameter: ' . $e->getMessage()]);
        }
    }
}
