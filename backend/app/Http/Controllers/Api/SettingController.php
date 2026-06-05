<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $lowThreshold = Setting::where('key', 'risk_low_threshold')->value('value') ?? 40;
        $mediumThreshold = Setting::where('key', 'risk_medium_threshold')->value('value') ?? 70;

        return response()->json([
            'risk_low_threshold' => floatval($lowThreshold),
            'risk_medium_threshold' => floatval($mediumThreshold)
        ]);
    }

    public function update(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'risk_low_threshold' => 'required|numeric|min:0|max:100',
            'risk_medium_threshold' => 'required|numeric|min:0|max:100',
        ]);

        $low = floatval($request->risk_low_threshold);
        $med = floatval($request->risk_medium_threshold);

        if ($low >= $med) {
            return response()->json([
                'message' => 'Batas bawah (Low Risk) harus lebih kecil daripada batas atas (Medium Risk).'
            ], 422);
        }

        DB::beginTransaction();
        try {
            Setting::updateOrCreate(['key' => 'risk_low_threshold'], ['value' => strval($low)]);
            Setting::updateOrCreate(['key' => 'risk_medium_threshold'], ['value' => strval($med)]);
            
            DB::commit();

            // System-wide recalculation since thresholds changed
            $populations = Population::all();
            foreach ($populations as $pop) {
                $pop->save();
            }

            return response()->json([
                'message' => 'Ambang batas risiko sistem berhasil diperbarui! Seluruh tingkat risiko debitur telah dikalkulasi ulang.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui pengaturan: ' . $e->getMessage()
            ], 500);
        }
    }
}
