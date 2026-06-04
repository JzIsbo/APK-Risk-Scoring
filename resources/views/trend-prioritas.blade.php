@extends('layouts.layout')

@section('title', 'Trend Prioritas')
@section('header_title', 'Trend Prioritas CO')
@section('header_subtitle', 'Analisis tren bulanan populasi dan risiko berdasarkan kelas CO (PR-1, PR-2, PR-3).')

@section('content')
{{-- Growth Cards --}}
@if(!empty($growthData))
<div class="metrics-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.5rem;">
    @foreach($growthData as $class => $g)
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:{{ $class==='PR-1'?'#00f0ff':($class==='PR-2'?'#0072ff':'#10b981') }}">
            <i class="fa-solid fa-chart-line"></i>
        </div>
        <div>
            <span class="metric-label">{{ $class }} (Periode Terakhir)</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($g['curr']) }}</span>
                <span class="metric-change {{ $g['diff'] >= 0 ? 'up' : 'down' }}">
                    <i class="fa-solid fa-caret-{{ $g['diff'] >= 0 ? 'up' : 'down' }}"></i>
                    {{ $g['diff'] >= 0 ? '+' : '' }}{{ $g['pct'] }}%
                </span>
            </div>
            <span style="font-size:0.7rem;color:var(--text-muted);">vs periode sebelumnya ({{ $g['prev'] }})</span>
        </div>
    </div>
    @endforeach
</div>
@endif

{{-- Charts Row 1 --}}
<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Trend Jumlah Debitur per CO</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">BULANAN</span>
        </div>
        <div style="height:240px;"><canvas id="chartTrendCo"></canvas></div>
    </div>
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Trend Risiko per Level</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">BULANAN</span>
        </div>
        <div style="height:240px;"><canvas id="chartTrendRisk"></canvas></div>
    </div>
</div>

{{-- Charts Row 2 --}}
<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Rata-rata Skor Risiko per Periode</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">TREN WAKTU</span>
        </div>
        <div style="height:220px;"><canvas id="chartAvgScore"></canvas></div>
    </div>
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Rata-rata DTI (%) per CO per Periode</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">KOMPARASI</span>
        </div>
        <div style="height:220px;"><canvas id="chartDtiTrend"></canvas></div>
    </div>
</div>

{{-- CO Breakdown Table --}}
<div class="glass-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Ringkasan per Kelas CO</h3>
        <a href="{{ route('laporan.export') }}" class="btn btn-secondary" style="font-size:0.8rem;">
            <i class="fa-solid fa-download"></i> Export Excel
        </a>
    </div>
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr>
                    <th>Kelas CO</th>
                    <th>Total Debitur</th>
                    <th>High Risk</th>
                    <th>Medium Risk</th>
                    <th>Low Risk</th>
                    <th>Avg Skor Risiko</th>
                    <th>Avg DTI (%)</th>
                    <th>% High Risk</th>
                </tr>
            </thead>
            <tbody>
                @foreach($coBreakdown as $class => $data)
                <tr>
                    <td>
                        <span class="badge badge-status" style="font-size:0.75rem;padding:4px 10px;">{{ $class }}</span>
                    </td>
                    <td style="font-weight:600;">{{ number_format($data['total']) }}</td>
                    <td><span style="color:#ef4444;font-weight:600;">{{ number_format($data['high']) }}</span></td>
                    <td><span style="color:#f59e0b;font-weight:600;">{{ number_format($data['medium']) }}</span></td>
                    <td><span style="color:#10b981;font-weight:600;">{{ number_format($data['low']) }}</span></td>
                    <td style="font-family:var(--font-display);font-weight:700;">{{ $data['avg_score'] }}</td>
                    <td>{{ $data['avg_dti'] }}%</td>
                    <td>
                        @php $pct = $data['total'] > 0 ? round(($data['high']/$data['total'])*100,1) : 0; @endphp
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="flex:1;background:rgba(255,255,255,0.07);border-radius:4px;height:6px;min-width:60px;">
                                <div style="height:100%;width:{{ $pct }}%;background:#ef4444;border-radius:4px;"></div>
                            </div>
                            <span style="font-size:0.8rem;font-weight:600;color:{{ $pct >= 30 ? '#ef4444' : ($pct >= 15 ? '#f59e0b' : '#10b981') }}">{{ $pct }}%</span>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection

@section('scripts')
<script>
const periodLabels = @json($periodLabels);
const gridStyle = { color:'rgba(255,255,255,0.05)', borderColor:'rgba(255,255,255,0.1)' };
const legendStyle = { labels:{ color:'#8e9bb4', font:{ family:'Plus Jakarta Sans', size:10 }, boxWidth:10, usePointStyle:true, pointStyle:'circle' }};

// Trend CO
new Chart(document.getElementById('chartTrendCo').getContext('2d'), {
    type: 'line',
    data: {
        labels: periodLabels,
        datasets: [
            { label:'PR-1', data:@json($trendPrioritas['PR-1']), borderColor:'#00d2ff', backgroundColor:'rgba(0,210,255,0.1)', tension:0.4, borderWidth:2, fill:true },
            { label:'PR-2', data:@json($trendPrioritas['PR-2']), borderColor:'#0072ff', backgroundColor:'rgba(0,114,255,0.1)', tension:0.4, borderWidth:2, fill:true },
            { label:'PR-3', data:@json($trendPrioritas['PR-3']), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.1)', tension:0.4, borderWidth:2, fill:true }
        ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', ...legendStyle }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }}, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }} }}
});

// Trend Risk Level
new Chart(document.getElementById('chartTrendRisk').getContext('2d'), {
    type: 'bar',
    data: {
        labels: periodLabels,
        datasets: [
            { label:'High', data:@json($trendRisk['High']), backgroundColor:'rgba(239,68,68,0.85)', borderRadius:4 },
            { label:'Medium', data:@json($trendRisk['Medium']), backgroundColor:'rgba(245,158,11,0.85)', borderRadius:4 },
            { label:'Low', data:@json($trendRisk['Low']), backgroundColor:'rgba(16,185,129,0.85)', borderRadius:4 }
        ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', ...legendStyle }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, stacked:true }, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, stacked:true } }}
});

// Avg Risk Score
new Chart(document.getElementById('chartAvgScore').getContext('2d'), {
    type: 'line',
    data: {
        labels: periodLabels,
        datasets: [{
            label: 'Rata-rata Skor Risiko',
            data: @json($avgRiskScore),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.15)',
            tension: 0.4, borderWidth: 2, fill: true,
            pointBackgroundColor: '#8b5cf6', pointRadius: 4
        }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }}, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, min:0, max:100 } }}
});

// DTI Trend
new Chart(document.getElementById('chartDtiTrend').getContext('2d'), {
    type: 'line',
    data: {
        labels: periodLabels,
        datasets: [
            { label:'PR-1', data:@json($avgDtiByClass['PR-1']), borderColor:'#00d2ff', tension:0.3, borderWidth:2, pointRadius:3 },
            { label:'PR-2', data:@json($avgDtiByClass['PR-2']), borderColor:'#0072ff', tension:0.3, borderWidth:2, pointRadius:3 },
            { label:'PR-3', data:@json($avgDtiByClass['PR-3']), borderColor:'#10b981', tension:0.3, borderWidth:2, pointRadius:3 }
        ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', ...legendStyle }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }}, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, min:0 } }}
});
</script>
@endsection
