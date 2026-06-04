@extends('layouts.layout')

@section('title', 'Risk Analysis')
@section('header_title', 'Analisis Risiko Debitur')
@section('header_subtitle', 'Analisis mendalam terhadap profil risiko seluruh debitur berdasarkan parameter scoring real-time.')

@section('content')
{{-- KPI Cards --}}
<div class="metrics-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 1.5rem;">
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#00f0ff"><i class="fa-solid fa-users"></i></div>
        <div>
            <span class="metric-label">Total Debitur</span>
            <div class="metric-value-container"><span class="metric-value">{{ number_format($stats['total']) }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#ef4444"><i class="fa-solid fa-radiation"></i></div>
        <div>
            <span class="metric-label">High Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#ef4444">{{ number_format($stats['high']) }}</span></div>
            <span style="font-size:0.7rem;color:var(--text-muted)">{{ $stats['total'] > 0 ? round(($stats['high']/$stats['total'])*100,1) : 0 }}% dari total</span>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#f59e0b"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div>
            <span class="metric-label">Medium Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#f59e0b">{{ number_format($stats['medium']) }}</span></div>
            <span style="font-size:0.7rem;color:var(--text-muted)">{{ $stats['total'] > 0 ? round(($stats['medium']/$stats['total'])*100,1) : 0 }}% dari total</span>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#10b981"><i class="fa-solid fa-shield-halved"></i></div>
        <div>
            <span class="metric-label">Low Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#10b981">{{ number_format($stats['low']) }}</span></div>
            <span style="font-size:0.7rem;color:var(--text-muted)">{{ $stats['total'] > 0 ? round(($stats['low']/$stats['total'])*100,1) : 0 }}% dari total</span>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#8b5cf6"><i class="fa-solid fa-gauge-high"></i></div>
        <div>
            <span class="metric-label">Avg. Risk Score</span>
            <div class="metric-value-container"><span class="metric-value">{{ $stats['avg_score'] }}</span></div>
            <span style="font-size:0.7rem;color:var(--text-muted)">DTI avg: {{ $stats['avg_dti'] }}%</span>
        </div>
    </div>
</div>

<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    {{-- Risk Distribution Chart --}}
    <div class="glass-card col-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Distribusi Risiko</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">SEMUA DATA</span>
        </div>
        <div style="position:relative; height:220px; width:100%;">
            <canvas id="chartRiskDist"></canvas>
        </div>
    </div>

    {{-- Risk by CO Class --}}
    <div class="glass-card col-5">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Risiko per Kelas CO</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">BREAKDOWN</span>
        </div>
        <div style="position:relative; height:220px; width:100%;">
            <canvas id="chartRiskByCo"></canvas>
        </div>
    </div>

    {{-- Top 5 Highest Risk --}}
    <div class="glass-card col-3">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Top Risiko Tertinggi</h3>
            <span style="font-size:0.7rem;color:var(--text-muted);">RANK</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;overflow-y:auto;max-height:220px;">
            @foreach($topRisk->take(5) as $i => $pop)
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:0.7rem;color:var(--text-muted);min-width:16px;">{{ $i+1 }}</span>
                <div style="flex:1;overflow:hidden;">
                    <div style="font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $pop->name }}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);">{{ $pop->co_class }} · {{ $pop->period }}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.9rem;font-weight:700;color:{{ $pop->risk_level=='High'?'#ef4444':($pop->risk_level=='Medium'?'#f59e0b':'#10b981') }}">{{ round($pop->risk_score,1) }}</div>
                    <span class="badge badge-{{ strtolower($pop->risk_level) }}" style="font-size:0.6rem;">{{ $pop->risk_level }}</span>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>

{{-- Filter + Table --}}
<div class="glass-card" style="margin-bottom:1.5rem;padding:1.25rem 1.5rem;">
    <form action="{{ route('risk-analysis.index') }}" method="GET" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <input type="text" name="search" class="form-control" placeholder="Cari nama debitur..." value="{{ request('search') }}" style="max-width:260px;">
        <select name="risk_level" class="form-control form-select" style="max-width:150px;">
            <option value="">Semua Risiko</option>
            <option value="High" {{ request('risk_level')=='High'?'selected':'' }}>High Risk</option>
            <option value="Medium" {{ request('risk_level')=='Medium'?'selected':'' }}>Medium Risk</option>
            <option value="Low" {{ request('risk_level')=='Low'?'selected':'' }}>Low Risk</option>
        </select>
        <select name="co_class" class="form-control form-select" style="max-width:140px;">
            <option value="">Semua CO</option>
            <option value="PR-1" {{ request('co_class')=='PR-1'?'selected':'' }}>PR-1</option>
            <option value="PR-2" {{ request('co_class')=='PR-2'?'selected':'' }}>PR-2</option>
            <option value="PR-3" {{ request('co_class')=='PR-3'?'selected':'' }}>PR-3</option>
        </select>
        <button type="submit" class="btn btn-secondary"><i class="fa-solid fa-filter"></i> Filter</button>
        @if(request()->anyFilled(['search','risk_level','co_class']))
            <a href="{{ route('risk-analysis.index') }}" class="btn btn-secondary">Reset</a>
        @endif
        <span style="font-size:0.8rem;color:var(--text-muted);margin-left:auto;">{{ $populations->total() }} debitur ditemukan</span>
    </form>
</div>

<div class="glass-card">
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama Debitur</th>
                    <th>CO / Period</th>
                    <th>Skor Risiko</th>
                    <th>Tingkat Risiko</th>
                    <th>DTI %</th>
                    <th>Keterlambatan</th>
                    <th>Skor Kredit</th>
                    <th>Beban CO %</th>
                    <th>Status</th>
                    <th>Detail</th>
                </tr>
            </thead>
            <tbody>
                @forelse($populations as $i => $pop)
                <tr style="cursor:pointer;" onclick="window.location='{{ route('risk-analysis.show', $pop->id) }}'">
                    <td style="color:var(--text-muted);font-size:0.8rem;">{{ $populations->firstItem() + $i }}</td>
                    <td style="font-weight:600;">{{ $pop->name }}</td>
                    <td>
                        <span class="badge badge-status" style="font-size:0.65rem;">{{ $pop->co_class }}</span>
                        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">{{ $pop->period }}</div>
                    </td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="flex:1;background:rgba(255,255,255,0.07);border-radius:4px;height:6px;min-width:60px;">
                                <div style="height:100%;width:{{ min($pop->risk_score, 100) }}%;background:{{ $pop->risk_level=='High'?'#ef4444':($pop->risk_level=='Medium'?'#f59e0b':'#10b981') }};border-radius:4px;"></div>
                            </div>
                            <span style="font-weight:700;font-family:var(--font-display);font-size:1rem;">{{ round($pop->risk_score, 1) }}</span>
                        </div>
                    </td>
                    <td>
                        @if($pop->risk_level==='High')
                            <span class="badge badge-high">High</span>
                        @elseif($pop->risk_level==='Medium')
                            <span class="badge badge-medium">Medium</span>
                        @else
                            <span class="badge badge-low">Low</span>
                        @endif
                    </td>
                    <td>{{ $pop->dti }}%</td>
                    <td>
                        <span style="color:{{ $pop->payment_delay > 90 ? '#ef4444' : ($pop->payment_delay > 30 ? '#f59e0b' : '#10b981') }}">
                            {{ $pop->payment_delay }} hari
                        </span>
                    </td>
                    <td>{{ $pop->credit_score }}</td>
                    <td>{{ $pop->co_burden }}%</td>
                    <td><span style="font-size:0.75rem;">{{ $pop->status }}</span></td>
                    <td>
                        <a href="{{ route('risk-analysis.show', $pop->id) }}" class="btn btn-secondary btn-sm" title="Detail Analisis" onclick="event.stopPropagation();">
                            <i class="fa-solid fa-magnifying-glass-chart"></i>
                        </a>
                    </td>
                </tr>
                @empty
                <tr><td colspan="11" style="text-align:center;color:var(--text-muted);padding:2rem;">Tidak ada data ditemukan.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($populations->hasPages())
    <div class="pagination-container">
        <div class="pagination-info">Menampilkan {{ $populations->firstItem() }} - {{ $populations->lastItem() }} dari {{ $populations->total() }} debitur</div>
        <div class="pagination-links">
            @if($populations->onFirstPage()) <span>&laquo;</span> @else <a href="{{ $populations->previousPageUrl() }}">&laquo;</a> @endif
            @foreach($populations->getUrlRange(1, $populations->lastPage()) as $page => $url)
                @if($page == $populations->currentPage()) <span class="active">{{ $page }}</span>
                @else <a href="{{ $url }}">{{ $page }}</a> @endif
            @endforeach
            @if($populations->hasMorePages()) <a href="{{ $populations->nextPageUrl() }}">&raquo;</a> @else <span>&raquo;</span> @endif
        </div>
    </div>
    @endif
</div>
@endsection

@section('scripts')
<script>
const gridStyle = { color:'rgba(255,255,255,0.05)', borderColor:'rgba(255,255,255,0.1)' };
const legendStyle = { labels: { color:'#8e9bb4', font:{ family:'Plus Jakarta Sans', size:10 }, boxWidth:10, usePointStyle:true, pointStyle:'circle' }};

// Risk distribution donut
new Chart(document.getElementById('chartRiskDist').getContext('2d'), {
    type: 'doughnut',
    data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{ data: [{{ $stats['high'] }}, {{ $stats['medium'] }}, {{ $stats['low'] }}], backgroundColor: ['#ef4444','#f59e0b','#10b981'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{ legend:{ position:'bottom', ...legendStyle }} }
});

// Risk by CO Class grouped bar
const riskByCoData = @json($riskByCo);
const coLabels = Object.keys(riskByCoData);
const coHigh   = coLabels.map(c => {
    const data = riskByCoData[c] || {};
    return data.High || data.high || 0;
});
const coMedium = coLabels.map(c => {
    const data = riskByCoData[c] || {};
    return data.Medium || data.medium || 0;
});
const coLow    = coLabels.map(c => {
    const data = riskByCoData[c] || {};
    return data.Low || data.low || 0;
});

new Chart(document.getElementById('chartRiskByCo').getContext('2d'), {
    type: 'bar',
    data: {
        labels: coLabels,
        datasets: [
            { label:'High', data: coHigh, backgroundColor:'rgba(239,68,68,0.85)', borderRadius:4 },
            { label:'Medium', data: coMedium, backgroundColor:'rgba(245,158,11,0.85)', borderRadius:4 },
            { label:'Low', data: coLow, backgroundColor:'rgba(16,185,129,0.85)', borderRadius:4 }
        ]
    },
    options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { legend:{ position:'bottom', ...legendStyle }},
        scales: {
            x: { grid: gridStyle, ticks:{ color:'#8e9bb4', font:{size:10} }},
            y: { grid: gridStyle, ticks:{ color:'#8e9bb4', font:{size:10} }, stacked:false }
        }
    }
});
</script>
@endsection
