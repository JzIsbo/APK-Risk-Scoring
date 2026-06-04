<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Population;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    /**
     * Show general settings.
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        $lowThreshold = Setting::where('key', 'risk_low_threshold')->value('value') ?? 40;
        $mediumThreshold = Setting::where('key', 'risk_medium_threshold')->value('value') ?? 70;

        return view('setting', compact('lowThreshold', 'mediumThreshold'));
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'risk_low_threshold' => 'required|numeric|min:0|max:100',
            'risk_medium_threshold' => 'required|numeric|min:0|max:100',
        ]);

        $low = floatval($request->risk_low_threshold);
        $med = floatval($request->risk_medium_threshold);

        if ($low >= $med) {
            return back()->withErrors(['risk_low_threshold' => 'Batas bawah (Low Risk) harus lebih kecil daripada batas atas (Medium Risk).']);
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

            return redirect()->route('settings.index')->with('success', 'Ambang batas risiko sistem berhasil diperbarui! Seluruh tingkat risiko debitur telah dikalkulasi ulang.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general_error' => 'Gagal memperbarui pengaturan: ' . $e->getMessage()]);
        }
    }
}
