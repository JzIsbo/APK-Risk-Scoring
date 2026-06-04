<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Risiko Debitur - Cetak PDF</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #ffffff;
            color: #1a1a1a;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #1e3a8a;
            font-weight: 700;
        }

        .header p {
            margin: 4px 0 0 0;
            color: #4b5563;
            font-size: 11px;
        }

        .meta-info {
            text-align: right;
            font-size: 10px;
            color: #6b7280;
        }

        /* KPI Cards Grid */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }

        .kpi-card {
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            border-radius: 6px;
            padding: 10px 12px;
            text-align: center;
        }

        .kpi-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .kpi-value {
            font-size: 16px;
            font-weight: 700;
            color: #1e3a8a;
        }

        /* Tables style */
        .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .print-table th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #1e293b;
            padding: 8px 10px;
            font-weight: 600;
            text-align: left;
        }

        .print-table td {
            border: 1px solid #e5e7eb;
            padding: 7px 10px;
            color: #374151;
        }

        .print-table tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-high {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }

        .badge-medium {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
        }

        .badge-low {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #6ee7b7;
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            .no-print {
                display: none;
            }
            .page-break {
                page-break-before: always;
            }
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    {{-- Top Printable Header --}}
    <div class="header">
        <div>
            <h1>LAPORAN ANALISIS RISIKO DEBITUR</h1>
            <p>Sistem Pemantauan dan Skoring Risiko Real-Time</p>
        </div>
        <div class="meta-info">
            <div>Digenerate: {{ now()->format('d M Y H:i') }}</div>
            <div>Filter: 
                @if($period) Periode {{ $period }} @else Semua Periode @endif
                @if($coClass) · CO {{ $coClass }} @endif
                @if($riskLevel) · Risiko {{ $riskLevel }} @endif
            </div>
        </div>
    </div>

    {{-- KPI Block --}}
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-label">Total Debitur</div>
            <div class="kpi-value">{{ number_format($summaryStats['filtered']) }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">High Risk</div>
            <div class="kpi-value" style="color: #ef4444;">{{ number_format($summaryStats['high']) }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Medium Risk</div>
            <div class="kpi-value" style="color: #f59e0b;">{{ number_format($summaryStats['medium']) }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Avg. Risk Score</div>
            <div class="kpi-value">{{ $summaryStats['avg_score'] }}</div>
        </div>
    </div>

    {{-- Charts Section --}}
    <div style="display: flex; gap: 15px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #fafafa; height: 180px; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; color: #1e3a8a; text-align: center; font-weight: 700;">Distribusi Tingkat Risiko</h3>
            <div style="position: relative; flex: 1; height: 140px;">
                <canvas id="chartRiskDist"></canvas>
            </div>
        </div>
        <div style="flex: 1.5; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #fafafa; height: 180px; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; color: #1e3a8a; text-align: center; font-weight: 700;">Risiko per Kelas CO</h3>
            <div style="position: relative; flex: 1; height: 140px;">
                <canvas id="chartRiskByCo"></canvas>
            </div>
        </div>
    </div>

    {{-- Main Debtor Table --}}
    <table class="print-table">
        <thead>
            <tr>
                <th style="width: 4%;">No.</th>
                <th style="width: 20%;">Nama Debitur</th>
                <th style="width: 8%;">Usia</th>
                <th style="width: 10%;">DTI %</th>
                <th style="width: 12%;">Delay (Hari)</th>
                <th style="width: 10%;">Kredit</th>
                <th style="width: 10%;">Beban CO%</th>
                <th style="width: 10%;">Skor Risiko</th>
                <th style="width: 10%;">Tingkat Risiko</th>
                <th style="width: 10%;">Periode</th>
            </tr>
        </thead>
        <tbody>
            @forelse($populations as $i => $pop)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td style="font-weight: 600; color: #1e3a8a;">{{ $pop->name }}</td>
                <td>{{ $pop->age }} th</td>
                <td>{{ $pop->dti }}%</td>
                <td>{{ $pop->payment_delay }} hari</td>
                <td>{{ $pop->credit_score }}</td>
                <td>{{ $pop->co_burden }}%</td>
                <td style="font-weight: 700;">{{ round($pop->risk_score, 2) }}</td>
                <td>
                    @if($pop->risk_level === 'High')
                        <span class="badge badge-high">High</span>
                    @elseif($pop->risk_level === 'Medium')
                        <span class="badge badge-medium">Medium</span>
                    @else
                        <span class="badge badge-low">Low</span>
                    @endif
                </td>
                <td>{{ $pop->period }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" style="text-align: center; color: #6b7280; padding: 20px;">Tidak ada data ditemukan.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <script>
        const gridStyle = { color: 'rgba(0,0,0,0.06)', borderColor: 'rgba(0,0,0,0.08)' };
        const legendStyle = {
            labels: {
                color: '#334155',
                font: { family: 'Segoe UI', size: 9 },
                boxWidth: 8,
                usePointStyle: true,
                pointStyle: 'circle'
            }
        };

        // 1. Risk distribution doughnut
        new Chart(document.getElementById('chartRiskDist').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [{{ $summaryStats['high'] }}, {{ $summaryStats['medium'] }}, {{ $summaryStats['low'] }}],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                animation: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        ...legendStyle
                    }
                }
            }
        });

        // 2. Risk by CO Class grouped bar
        const riskByCoData = @json($riskByCo);
        const coLabels = Object.keys(riskByCoData);
        const coHigh = coLabels.map(c => {
            const data = riskByCoData[c] || {};
            return data.High || data.high || 0;
        });
        const coMedium = coLabels.map(c => {
            const data = riskByCoData[c] || {};
            return data.Medium || data.medium || 0;
        });
        const coLow = coLabels.map(c => {
            const data = riskByCoData[c] || {};
            return data.Low || data.low || 0;
        });

        new Chart(document.getElementById('chartRiskByCo').getContext('2d'), {
            type: 'bar',
            data: {
                labels: coLabels,
                datasets: [
                    { label: 'High', data: coHigh, backgroundColor: '#ef4444', borderRadius: 2 },
                    { label: 'Medium', data: coMedium, backgroundColor: '#f59e0b', borderRadius: 2 },
                    { label: 'Low', data: coLow, backgroundColor: '#10b981', borderRadius: 2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        ...legendStyle
                    }
                },
                scales: {
                    x: {
                        grid: gridStyle,
                        ticks: { color: '#334155', font: { size: 9 } }
                    },
                    y: {
                        grid: gridStyle,
                        ticks: { color: '#334155', font: { size: 9 } },
                        beginAtZero: true
                    }
                }
            }
        });

        window.onload = function() {
            // Give a tiny timeout for canvas drawing to be flushed to screen buffer
            setTimeout(function() {
                window.print();
            }, 100);
            window.onafterprint = function() {
                window.history.back();
            };
        };
    </script>
</body>
</html>
