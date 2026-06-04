@extends('layouts.layout')

@section('title', 'Pola Bayar')
@section('header_title', 'Pola Bayar & PS AMBC')
@section('header_subtitle', 'Analisis pola pembayaran akhir debitur, distribusi PS AMBC, dan tren keterlambatan.')

@section('content')
{{-- Summary Cards --}}
<div class="metrics-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.5rem;">
    @foreach($patternSummary as $pattern => $data)
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:{{ $pattern==='L3'?'#10b981':($pattern==='L4'?'#f59e0b':'#ef4444') }}">
            <i class="fa-solid fa-receipt"></i>
        </div>
        <div>
            <span class="metric-label">Pola Bayar {{ $pattern }}</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($data['total']) }}</span>
            </div>
            <span style="font-size:0.7rem;color:var(--text-muted);">High Risk: {{ $data['high_risk'] }} · Avg Score: {{ $data['avg_score'] }}</span>
        </div>
    </div>
    @endforeach
</div>

{{-- Charts Row 1 --}}
<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Tren Pola Bayar per Periode</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">BULANAN</span>
        </div>
        <div style="height:240px;"><canvas id="chartPolaBayarTrend"></canvas></div>
    </div>
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Tren PS AMBC per Periode</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">BULANAN</span>
        </div>
        <div style="height:240px;"><canvas id="chartPsAmbcTrend"></canvas></div>
    </div>
</div>

{{-- Charts Row 2 --}}
<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    <div class="glass-card col-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Distribusi Pola Bayar</h3>
        </div>
        <div style="position:relative; height:200px; width:100%;"><canvas id="chartPolaDonut"></canvas></div>
    </div>
    <div class="glass-card col-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Distribusi PS AMBC</h3>
        </div>
        <div style="position:relative; height:200px; width:100%;"><canvas id="chartPsDonut"></canvas></div>
    </div>
    <div class="glass-card col-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Avg Keterlambatan per Periode</h3>
        </div>
        <div style="height:200px;"><canvas id="chartAvgDelay"></canvas></div>
    </div>
</div>

{{-- Tables Row --}}
<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    {{-- Pattern Summary Table --}}
    <div class="glass-card col-6">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Detail Pola Bayar</h3>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr><th>Pola Bayar</th><th>Total</th><th>High Risk</th><th>Avg Score</th><th>Avg Delay (Hari)</th></tr>
                </thead>
                <tbody>
                    @foreach($patternSummary as $pattern => $data)
                    <tr>
                        <td><span class="badge badge-status" style="font-size:0.75rem;">{{ $pattern }}</span></td>
                        <td style="font-weight:600;">{{ $data['total'] }}</td>
                        <td><span style="color:#ef4444;font-weight:600;">{{ $data['high_risk'] }}</span></td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ $data['avg_score'] }}</td>
                        <td style="color:{{ $data['avg_delay'] > 60 ? '#ef4444' : ($data['avg_delay'] > 30 ? '#f59e0b' : '#10b981') }}">{{ $data['avg_delay'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- PS AMBC Summary Table --}}
    <div class="glass-card col-6">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Detail PS AMBC</h3>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr><th>PS AMBC</th><th>Total</th><th>High Risk</th><th>Avg Score</th><th>% High Risk</th></tr>
                </thead>
                <tbody>
                    @foreach($psAmbcSummary as $ps => $data)
                    @php $pct = $data['total'] > 0 ? round(($data['high_risk']/$data['total'])*100,1) : 0; @endphp
                    <tr>
                        <td><span class="badge badge-status" style="font-size:0.75rem;">{{ $ps }}</span></td>
                        <td style="font-weight:600;">{{ $data['total'] }}</td>
                        <td><span style="color:#ef4444;font-weight:600;">{{ $data['high_risk'] }}</span></td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ $data['avg_score'] }}</td>
                        <td>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div style="flex:1;background:rgba(255,255,255,0.07);border-radius:3px;height:5px;min-width:50px;">
                                    <div style="height:100%;width:{{ $pct }}%;background:#ef4444;border-radius:3px;"></div>
                                </div>
                                <span style="font-size:0.8rem;font-weight:600;">{{ $pct }}%</span>
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Status x Pattern Crosstab --}}
<div class="glass-card">
    <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Status Order per Pola Bayar</h3>
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr><th>Pola Bayar</th><th>No Order</th><th>Active</th><th>Settled</th><th>Total</th></tr>
            </thead>
            <tbody>
                @foreach($noOrderByPattern as $pattern => $counts)
                @php $tot = array_sum($counts); @endphp
                <tr>
                    <td><span class="badge badge-status" style="font-size:0.75rem;">{{ $pattern }}</span></td>
                    <td><span style="color:#f59e0b;font-weight:600;">{{ $counts['no_order'] }}</span></td>
                    <td><span style="color:#00f0ff;font-weight:600;">{{ $counts['active'] }}</span></td>
                    <td><span style="color:#10b981;font-weight:600;">{{ $counts['settled'] }}</span></td>
                    <td style="font-weight:700;">{{ $tot }}</td>
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

// Pola Bayar Trend
new Chart(document.getElementById('chartPolaBayarTrend').getContext('2d'), {
    type: 'line',
    data: {
        labels: periodLabels,
        datasets: [
            { label:'L3', data:@json($polaBayarData['L3']), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.1)', tension:0.4, borderWidth:2, fill:true },
            { label:'L4', data:@json($polaBayarData['L4']), borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.1)', tension:0.4, borderWidth:2, fill:true },
            { label:'L5', data:@json($polaBayarData['L5']), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.1)', tension:0.4, borderWidth:2, fill:true }
        ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', ...legendStyle }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }}, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} } } }}
});

// PS AMBC Trend
new Chart(document.getElementById('chartPsAmbcTrend').getContext('2d'), {
    type: 'bar',
    data: {
        labels: periodLabels,
        datasets: [
            { label:'PS-1', data:@json($psAmbcData['PS-1']), backgroundColor:'rgba(236,72,153,0.85)', borderRadius:4 },
            { label:'PS-2', data:@json($psAmbcData['PS-2']), backgroundColor:'rgba(139,92,246,0.85)', borderRadius:4 },
            { label:'PS-3', data:@json($psAmbcData['PS-3']), backgroundColor:'rgba(59,130,246,0.85)', borderRadius:4 },
            { label:'PS-4', data:@json($psAmbcData['PS-4']), backgroundColor:'rgba(20,184,166,0.85)', borderRadius:4 }
        ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', ...legendStyle }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, stacked:true }, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, stacked:true } }}
});

// Pola Bayar Donut
new Chart(document.getElementById('chartPolaDonut').getContext('2d'), {
    type: 'doughnut',
    data: {
        labels: ['L3','L4','L5'],
        datasets: [{ data:@json(array_column($patternSummary,'total')), backgroundColor:['#10b981','#f59e0b','#ef4444'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', ...legendStyle }} }
});

// PS AMBC Donut
new Chart(document.getElementById('chartPsDonut').getContext('2d'), {
    type: 'doughnut',
    data: {
        labels: ['PS-1','PS-2','PS-3','PS-4'],
        datasets: [{ data:@json(array_column($psAmbcSummary,'total')), backgroundColor:['#ec4899','#8b5cf6','#3b82f6','#14b8a6'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', ...legendStyle }} }
});

// Avg Delay
new Chart(document.getElementById('chartAvgDelay').getContext('2d'), {
    type: 'bar',
    data: {
        labels: periodLabels,
        datasets: [{ label:'Avg Keterlambatan (Hari)', data:@json($avgDelayPerPeriod), backgroundColor:'rgba(245,158,11,0.8)', borderRadius:5 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }}, scales:{ x:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }}, y:{ grid:gridStyle, ticks:{ color:'#8e9bb4', font:{size:9} }, min:0 } }}
});
</script>
@endsection
