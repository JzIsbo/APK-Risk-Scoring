<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RiskParameter;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParameterController extends Controller
{
    /**
     * Get parameter weighting configurations.
     */
    public function index()
    {
        $parameters = RiskParameter::all();
        $totalWeight = $parameters->sum('weight');

        return response()->json([
            'parameters' => $parameters,
            'totalWeight' => $totalWeight
        ]);
    }

    /**
     * Update parameter weights and criteria rules, triggering recalculation.
     */
    public function update(Request $request)
    {
        $weights = $request->input('weights', []);
        $criteriaData = $request->input('criteria', []);

        // Validate that total weight equals 100%
        $totalWeight = array_sum($weights);
        if (abs($totalWeight - 100) > 0.01) {
            return response()->json([
                'message' => 'Total bobot parameter harus tepat berjumlah 100%. Saat ini: ' . $totalWeight . '%'
            ], 422);
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
                $pop->save(); // observers trigger recalculations
            }

            return response()->json([
                'message' => 'Parameter penilaian risiko berhasil diperbarui! Seluruh data debitur telah di-kalkulasi ulang secara otomatis.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui parameter: ' . $e->getMessage()
            ], 500);
        }
    }
}
