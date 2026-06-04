<?php

namespace App\Http\Controllers;

use App\Models\Population;
use App\Models\RiskParameter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $period   = $request->get('period');
        $coClass  = $request->get('co_class');
        $riskLevel = $request->get('risk_level');

        $query = Population::query();

        if ($period)    $query->where('period', $period);
        if ($coClass)   $query->where('co_class', $coClass);
        if ($riskLevel) $query->where('risk_level', $riskLevel);

        $populations = $query->orderBy('risk_score', 'desc')->paginate(20)->withQueryString();

        // Summary stats (filtered)
        $allFiltered = clone $query;
        $summaryStats = [
            'total'      => Population::count(),
            'filtered'   => $allFiltered->count(),
            'high'       => Population::where('risk_level', 'High')->count(),
            'medium'     => Population::where('risk_level', 'Medium')->count(),
            'low'        => Population::where('risk_level', 'Low')->count(),
            'avg_score'  => round(Population::avg('risk_score') ?? 0, 2),
            'avg_dti'    => round(Population::avg('dti') ?? 0, 2),
            'avg_delay'  => round(Population::avg('payment_delay') ?? 0, 1),
            'no_order'   => Population::where('status', 'No Order')->count(),
        ];

        // Available filter options
        $availablePeriods = Population::select('period')
            ->distinct()->orderBy('period', 'desc')->pluck('period');

        // Distribution tables
        $byCoClass = Population::select('co_class', 'risk_level', DB::raw('count(*) as cnt'))
            ->groupBy('co_class', 'risk_level')
            ->get()
            ->groupBy('co_class');

        $byPattern = Population::select('payment_pattern', DB::raw('count(*) as cnt'), DB::raw('avg(risk_score) as avg_score'))
            ->groupBy('payment_pattern')
            ->get();

        $byPsAmbc  = Population::select('ps_ambc', DB::raw('count(*) as cnt'), DB::raw('avg(risk_score) as avg_score'))
            ->groupBy('ps_ambc')
            ->get();

        return view('laporan', compact(
            'populations', 'summaryStats', 'availablePeriods',
            'byCoClass', 'byPattern', 'byPsAmbc',
            'period', 'coClass', 'riskLevel'
        ));
    }

    public function export(Request $request)
    {
        $period    = $request->get('period');
        $coClass   = $request->get('co_class');
        $riskLevel = $request->get('risk_level');

        $query = Population::query();
        if ($period)    $query->where('period', $period);
        if ($coClass)   $query->where('co_class', $coClass);
        if ($riskLevel) $query->where('risk_level', $riskLevel);

        $populations = $query->orderBy('risk_score', 'desc')->get();

        $spreadsheet = new Spreadsheet();

        // 1. Create and Style Summary Sheet (Ringkasan) first
        $summarySheet = $spreadsheet->getActiveSheet();
        $summarySheet->setTitle('Ringkasan Analisis');
        $summarySheet->setShowGridlines(true);

        // Title Block (No background color, dark text)
        $summarySheet->setCellValue('A1', 'RINGKASAN ANALISIS RISIKO DEBITUR');
        $summarySheet->mergeCells('A1:C1');
        $summarySheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '0f172a']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $summarySheet->getRowDimension(1)->setRowHeight(35);

        // Subtitle Block (No background color, dark slate text)
        $filterDesc = 'Semua Data';
        if ($period) $filterDesc = "Periode: {$period}";
        if ($coClass) $filterDesc .= " | CO: {$coClass}";
        if ($riskLevel) $filterDesc .= " | Risk: {$riskLevel}";
        $summarySheet->setCellValue('A2', "Filter: {$filterDesc} | Tanggal Ekspor: " . now()->format('d/m/Y H:i'));
        $summarySheet->mergeCells('A2:C2');
        $summarySheet->getStyle('A2')->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '475569']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $summarySheet->getRowDimension(2)->setRowHeight(20);

        // Table Headers (No background color, dark text, clean borders)
        $summaryHeaders = ['No.', 'Metrik / Parameter Analisis', 'Nilai Statistik'];
        $cols = ['A', 'B', 'C'];
        foreach ($summaryHeaders as $i => $header) {
            $summarySheet->setCellValue($cols[$i] . '4', $header);
        }

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => '0f172a'], 'size' => 11],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '808080']],
            ],
        ];
        $summarySheet->getStyle('A4:C4')->applyFromArray($headerStyle);
        $summarySheet->getRowDimension(4)->setRowHeight(25);

        // Data Rows
        $summaryData = [
            ['Total Debitur', Population::count(), '#,##0'],
            ['Debitur Risiko Tinggi (High Risk)', Population::where('risk_level', 'High')->count(), '#,##0'],
            ['Debitur Risiko Sedang (Medium Risk)', Population::where('risk_level', 'Medium')->count(), '#,##0'],
            ['Debitur Risiko Rendah (Low Risk)', Population::where('risk_level', 'Low')->count(), '#,##0'],
            ['Rata-rata Skor Risiko', Population::avg('risk_score') ?? 0, '0.00'],
            ['Rata-rata DTI (%)', Population::avg('dti') ?? 0, '0.00"%"'],
            ['Rata-rata Keterlambatan (Hari)', Population::avg('payment_delay') ?? 0, '0.0'],
            ['Total Debitur No Order', Population::where('status', 'No Order')->count(), '#,##0'],
        ];

        $thinBorder = [
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '808080']],
            ],
        ];

        $sRow = 5;
        foreach ($summaryData as $i => [$label, $value, $format]) {
            $summarySheet->setCellValue("A{$sRow}", $i + 1);
            $summarySheet->setCellValue("B{$sRow}", $label);
            $summarySheet->setCellValue("C{$sRow}", $value);

            // Format cell values
            $summarySheet->getStyle("C{$sRow}")->getNumberFormat()->setFormatCode($format);

            // Alignments
            $summarySheet->getStyle("A{$sRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $summarySheet->getStyle("B{$sRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $summarySheet->getStyle("C{$sRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            // Styling
            $bg = ($sRow % 2 === 0) ? 'f8fafc' : 'ffffff';
            $summarySheet->getStyle("A{$sRow}:C{$sRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $bg]],
                'font' => ['color' => ['rgb' => '1e293b']],
            ]);

            // Borders
            $summarySheet->getStyle("A{$sRow}:C{$sRow}")->applyFromArray($thinBorder);
            $summarySheet->getRowDimension($sRow)->setRowHeight(22);
            $sRow++;
        }

        $summarySheet->getColumnDimension('A')->setWidth(8);
        $summarySheet->getColumnDimension('B')->setWidth(35);
        $summarySheet->getColumnDimension('C')->setWidth(20);

        // 2. Create and Style Data Sheet (Data Risiko Debitur)
        $dataSheet = $spreadsheet->createSheet();
        $dataSheet->setTitle('Data Risiko Debitur');
        $dataSheet->setShowGridlines(true);

        // Title Block (No background color, dark text)
        $dataSheet->setCellValue('A1', 'LAPORAN DATA DETIL RISIKO DEBITUR');
        $dataSheet->mergeCells('A1:N1');
        $dataSheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '0f172a']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $dataSheet->getRowDimension(1)->setRowHeight(35);

        // Subtitle Block (No background color, dark slate text)
        $dataSheet->setCellValue('A2', "Filter: {$filterDesc} | Tanggal Ekspor: " . now()->format('d/m/Y H:i'));
        $dataSheet->mergeCells('A2:N2');
        $dataSheet->getStyle('A2')->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '475569']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $dataSheet->getRowDimension(2)->setRowHeight(20);

        // Table Headers (No background color, dark text, clean borders)
        $headers = [
            'A' => 'No.', 'B' => 'Nama Debitur', 'C' => 'Usia', 'D' => 'DTI (%)',
            'E' => 'Keterlambatan (Hari)', 'F' => 'Skor Kredit', 'G' => 'Beban CO (%)',
            'H' => 'Skor Risiko', 'I' => 'Tingkat Risiko', 'J' => 'Status',
            'K' => 'Kelas CO', 'L' => 'Pola Bayar', 'M' => 'PS AMBC', 'N' => 'Periode'
        ];

        foreach ($headers as $col => $header) {
            $dataSheet->setCellValue("{$col}3", $header);
        }

        $dataHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => '0f172a'], 'size' => 10],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '808080']],
            ],
        ];
        $dataSheet->getStyle('A3:N3')->applyFromArray($dataHeaderStyle);
        $dataSheet->getRowDimension(3)->setRowHeight(25);

        // Data Rows
        $row = 4;
        foreach ($populations as $i => $pop) {
            $dataSheet->setCellValue("A{$row}", $i + 1);
            $dataSheet->setCellValue("B{$row}", $pop->name);
            $dataSheet->setCellValue("C{$row}", $pop->age);
            $dataSheet->setCellValue("D{$row}", $pop->dti);
            $dataSheet->setCellValue("E{$row}", $pop->payment_delay);
            $dataSheet->setCellValue("F{$row}", $pop->credit_score);
            $dataSheet->setCellValue("G{$row}", $pop->co_burden);
            $dataSheet->setCellValue("H{$row}", round($pop->risk_score, 2));
            $dataSheet->setCellValue("I{$row}", $pop->risk_level);
            $dataSheet->setCellValue("J{$row}", $pop->status);
            $dataSheet->setCellValue("K{$row}", $pop->co_class);
            $dataSheet->setCellValue("L{$row}", $pop->payment_pattern);
            $dataSheet->setCellValue("M{$row}", $pop->ps_ambc);
            $dataSheet->setCellValue("N{$row}", $pop->period);

            // Format numbers
            $dataSheet->getStyle("D{$row}")->getNumberFormat()->setFormatCode('0"%"');
            $dataSheet->getStyle("G{$row}")->getNumberFormat()->setFormatCode('0"%"');
            $dataSheet->getStyle("H{$row}")->getNumberFormat()->setFormatCode('0.00');

            // Color code risk level with clean pastel colors and dark text
            $riskColors = match($pop->risk_level) {
                'High'   => ['bg' => 'fee2e2', 'fg' => '991b1b'], // light red / dark red
                'Medium' => ['bg' => 'fef3c7', 'fg' => '92400e'], // light amber / dark amber
                'Low'    => ['bg' => 'd1fae5', 'fg' => '065f46'], // light emerald / dark emerald
                default  => ['bg' => 'ffffff', 'fg' => '1e293b'],
            };

            $dataSheet->getStyle("I{$row}")->applyFromArray([
                'font' => ['color' => ['rgb' => $riskColors['fg']], 'bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $riskColors['bg']]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Alternating rows styling for columns (excluding I which has specific risk colors)
            $bg = ($row % 2 === 0) ? 'f8fafc' : 'ffffff';
            $rowStyle = [
                'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $bg]],
                'font' => ['color' => ['rgb' => '1e293b']],
            ];

            $colsToApply = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N'];
            foreach ($colsToApply as $col) {
                $dataSheet->getStyle("{$col}{$row}")->applyFromArray($rowStyle);
            }

            // Apply borders to all columns in the row
            $dataSheet->getStyle("A{$row}:N{$row}")->applyFromArray($thinBorder);

            // Alignments
            $dataSheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $dataSheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $dataSheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("F{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("G{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $dataSheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $dataSheet->getStyle("J{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("L{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("M{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dataSheet->getStyle("N{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $dataSheet->getRowDimension($row)->setRowHeight(20);
            $row++;
        }

        // Auto-size columns to fit data nicely
        foreach (range('A', 'N') as $col) {
            $dataSheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Stream as download
        $filename = 'laporan-risiko-debitur-' . now()->format('Ymd-His') . '.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function exportPdf(Request $request)
    {
        $period   = $request->get('period');
        $coClass  = $request->get('co_class');
        $riskLevel = $request->get('risk_level');

        $query = Population::query();

        if ($period)    $query->where('period', $period);
        if ($coClass)   $query->where('co_class', $coClass);
        if ($riskLevel) $query->where('risk_level', $riskLevel);

        $populations = (clone $query)->orderBy('risk_score', 'desc')->get();

        $summaryStats = [
            'total'      => Population::count(),
            'filtered'   => $populations->count(),
            'high'       => $populations->where('risk_level', 'High')->count(),
            'medium'     => $populations->where('risk_level', 'Medium')->count(),
            'low'        => $populations->where('risk_level', 'Low')->count(),
            'avg_score'  => round($populations->avg('risk_score') ?? 0, 2),
        ];

        // Risk distribution by CO class — prepared for Chart.js
        $riskByCoRaw = $query->select('co_class', 'risk_level', DB::raw('count(*) as total'))
            ->groupBy('co_class', 'risk_level')
            ->get();

        $riskByCo = [];
        foreach ($riskByCoRaw as $row) {
            $riskByCo[$row->co_class][$row->risk_level] = $row->total;
        }

        return view('laporan-print', compact(
            'populations', 'summaryStats', 'period', 'coClass', 'riskLevel', 'riskByCo'
        ));
    }
}
