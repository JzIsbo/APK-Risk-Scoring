<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Population;
use App\Models\RiskParameter;
use Illuminate\Http\Request;

class PopulationController extends Controller
{
    /**
     * Display a listing of the population.
     */
    public function index(Request $request)
    {
        $query = Population::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('co_class', 'like', "%{$search}%")
                  ->orWhere('risk_level', 'like', "%{$search}%");
            });
        }

        // Risk Level filter
        if ($request->filled('risk_level')) {
            $query->where('risk_level', $request->risk_level);
        }

        // CO Class filter
        if ($request->filled('co_class')) {
            $query->where('co_class', $request->co_class);
        }

        $perPage = $request->input('per_page', 10);
        $populations = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($populations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'dti' => 'required|numeric|min:0|max:100',
            'payment_delay' => 'required|integer|min:0',
            'credit_score' => 'required|integer|min:300|max:850',
            'age' => 'required|integer|min:1|max:120',
            'co_burden' => 'required|numeric|min:0|max:100',
            'status' => 'required|string',
            'co_class' => 'required|string',
            'payment_pattern' => 'required|string',
            'ps_ambc' => 'required|string',
            'period' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $population = Population::create($validated);

        return response()->json([
            'message' => 'Data debitur berhasil ditambahkan dan tingkat risiko dihitung secara real-time!',
            'data' => $population
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $population = Population::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'dti' => 'required|numeric|min:0|max:100',
            'payment_delay' => 'required|integer|min:0',
            'credit_score' => 'required|integer|min:300|max:850',
            'age' => 'required|integer|min:1|max:120',
            'co_burden' => 'required|numeric|min:0|max:100',
            'status' => 'required|string',
            'co_class' => 'required|string',
            'payment_pattern' => 'required|string',
            'ps_ambc' => 'required|string',
            'period' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $population->update($validated);

        return response()->json([
            'message' => 'Data debitur berhasil diperbarui!',
            'data' => $population
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $population = Population::findOrFail($id);
        $population->delete();

        return response()->json([
            'message' => 'Data debitur berhasil dihapus!'
        ]);
    }

    /**
     * API to preview the calculated risk score and level in real-time as the user types.
     */
    public function previewRisk(Request $request)
    {
        $dti = floatval($request->input('dti', 0));
        $payment_delay = intval($request->input('payment_delay', 0));
        $credit_score = intval($request->input('credit_score', 0));
        $age = intval($request->input('age', 0));
        $co_burden = floatval($request->input('co_burden', 0));

        // Create a temporary instance (not saved)
        $temp = new Population([
            'dti' => $dti,
            'payment_delay' => $payment_delay,
            'credit_score' => $credit_score,
            'age' => $age,
            'co_burden' => $co_burden,
        ]);

        // Trigger manual recalculation
        $temp->recalculateRisk();

        return response()->json([
            'risk_score' => round($temp->risk_score, 2),
            'risk_level' => $temp->risk_level,
        ]);
    }

    /**
     * Recalculate risk scores for all populations in database.
     */
    public function recalculateAll()
    {
        $populations = Population::all();
        
        foreach ($populations as $pop) {
            $pop->save(); // observers trigger recalculateRisk
        }

        return response()->json([
            'message' => 'Semua data debitur berhasil di-kalkulasi ulang berdasarkan parameter terbaru!'
        ]);
    }

    /**
     * Import population records from Excel/CSV file and calculate risk score on the fly.
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv,txt'
        ]);

        $file = $request->file('file');

        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (count($rows) <= 1) {
                return response()->json([
                    'message' => 'Berkas Excel kosong atau tidak memiliki baris data.'
                ], 422);
            }

            // Extract header columns to map indexes
            $headers = array_map(function($h) {
                return strtolower(trim($h));
            }, $rows[0]);

            // Define mapping fields and potential matches
            $fieldMappings = [
                'name' => ['nama', 'name', 'nama debitur', 'debtor name', 'debitur'],
                'age' => ['usia', 'umur', 'age', 'usia (tahun)'],
                'dti' => ['dti', 'rasio utang', 'debt to income', 'dti (%)', 'dti%', 'rasio utang (dti %)'],
                'payment_delay' => ['keterlambatan', 'delay', 'payment delay', 'hari keterlambatan', 'payment_delay', 'keterlambatan (hari)'],
                'credit_score' => ['skor kredit', 'credit score', 'credit_score'],
                'co_burden' => ['beban co', 'rasio beban co', 'co burden', 'co_burden', 'co burden (%)', 'co burden%', 'rasio beban co (%)'],
                'status' => ['status'],
                'co_class' => ['kelas co', 'co class', 'co_class', 'kelas_co'],
                'payment_pattern' => ['pola bayar', 'payment pattern', 'payment_pattern', 'pola_bayar'],
                'ps_ambc' => ['ps ambc', 'ps_ambc', 'ps ambc class'],
                'period' => ['periode', 'period', 'bulan', 'month']
            ];

            $mappedIndexes = [];
            foreach ($fieldMappings as $field => $terms) {
                $mappedIndexes[$field] = -1;
                foreach ($headers as $idx => $header) {
                    if (in_array($header, $terms)) {
                        $mappedIndexes[$field] = $idx;
                        break;
                    }
                }
            }

            // Check if essential columns are mapped
            $essentialFields = ['name', 'dti', 'payment_delay', 'credit_score', 'age', 'co_burden'];
            foreach ($essentialFields as $field) {
                if ($mappedIndexes[$field] === -1) {
                    return response()->json([
                        'message' => "Kolom penting '{$field}' tidak dapat dicocokkan di file Excel. Pastikan nama header sesuai."
                    ], 422);
                }
            }

            $successCount = 0;
            // Iterate from index 1 (second row)
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                if (empty($row) || !isset($row[$mappedIndexes['name']]) || trim($row[$mappedIndexes['name']]) === '') {
                    continue;
                }

                // Retrieve mapped values with safety defaults
                $data = [
                    'name' => strval($row[$mappedIndexes['name']]),
                    'age' => intval($row[$mappedIndexes['age']]),
                    'dti' => floatval($row[$mappedIndexes['dti']]),
                    'payment_delay' => intval($row[$mappedIndexes['payment_delay']]),
                    'credit_score' => intval($row[$mappedIndexes['credit_score']]),
                    'co_burden' => floatval($row[$mappedIndexes['co_burden']]),
                    'status' => $mappedIndexes['status'] !== -1 && isset($row[$mappedIndexes['status']]) ? strval($row[$mappedIndexes['status']]) : 'No Order',
                    'co_class' => $mappedIndexes['co_class'] !== -1 && isset($row[$mappedIndexes['co_class']]) ? strval($row[$mappedIndexes['co_class']]) : 'PR-1',
                    'payment_pattern' => $mappedIndexes['payment_pattern'] !== -1 && isset($row[$mappedIndexes['payment_pattern']]) ? strval($row[$mappedIndexes['payment_pattern']]) : 'L3',
                    'ps_ambc' => $mappedIndexes['ps_ambc'] !== -1 && isset($row[$mappedIndexes['ps_ambc']]) ? strval($row[$mappedIndexes['ps_ambc']]) : 'PS-1',
                    'period' => $mappedIndexes['period'] !== -1 && isset($row[$mappedIndexes['period']]) ? strval($row[$mappedIndexes['period']]) : '2026-04',
                ];

                // Validate and fallback
                if (empty($data['status'])) $data['status'] = 'No Order';
                if (empty($data['co_class'])) $data['co_class'] = 'PR-1';
                if (empty($data['payment_pattern'])) $data['payment_pattern'] = 'L3';
                if (empty($data['ps_ambc'])) $data['ps_ambc'] = 'PS-1';
                if (empty($data['period']) || !preg_match('/^\d{4}-\d{2}$/', $data['period'])) {
                    $data['period'] = '2026-04';
                }

                Population::create($data);
                $successCount++;
            }

            return response()->json([
                'message' => "Berhasil mengimpor {$successCount} data debitur dari Excel. Seluruh risiko telah dikalkulasi ulang secara real-time!"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membaca berkas Excel: ' . $e->getMessage()
            ], 500);
        }
    }
}
