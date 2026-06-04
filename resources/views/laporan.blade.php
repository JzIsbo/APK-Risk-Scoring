@extends('layouts.layout')

@section('title', 'Laporan')
@section('header_title', 'Laporan & Ekspor Data')
@section('header_subtitle', 'Generate dan ekspor laporan data risiko debitur dalam format Excel yang telah terformat.')

@section('content')
{{-- Filter Section --}}
<div class="glass-card" style="margin-bottom:1.5rem;padding:1.25rem 1.5rem;">
    <form action="{{ route('laporan.index') }}" method="GET" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Periode</label>
            <select name="period" class="form-control form-select" style="max-width:160px;">
                <option value="">Semua Periode</option>
                @foreach($availablePeriods as $p)
                <option value="{{ $p }}" {{ $period === $p ? 'selected' : '' }}>{{ $p }}</option>
                @endforeach
            </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Kelas CO</label>
            <select name="co_class" class="form-control form-select" style="max-width:140px;">
                <option value="">Semua CO</option>
                <option value="PR-1" {{ $coClass==='PR-1'?'selected':'' }}>PR-1</option>
                <option value="PR-2" {{ $coClass==='PR-2'?'selected':'' }}>PR-2</option>
                <option value="PR-3" {{ $coClass==='PR-3'?'selected':'' }}>PR-3</option>
            </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Tingkat Risiko</label>
            <select name="risk_level" class="form-control form-select" style="max-width:150px;">
                <option value="">Semua Risiko</option>
                <option value="High" {{ $riskLevel==='High'?'selected':'' }}>High Risk</option>
                <option value="Medium" {{ $riskLevel==='Medium'?'selected':'' }}>Medium Risk</option>
                <option value="Low" {{ $riskLevel==='Low'?'selected':'' }}>Low Risk</option>
            </select>
        </div>
        <button type="submit" class="btn btn-secondary" style="align-self:flex-end;">
            <i class="fa-solid fa-filter"></i> Filter
        </button>
        @if($period || $coClass || $riskLevel)
        <a href="{{ route('laporan.index') }}" class="btn btn-secondary" style="align-self:flex-end;">Reset</a>
        @endif
        <div style="margin-left:auto;display:flex;gap:10px;align-self:flex-end;">
            <a href="{{ route('laporan.export-pdf', ['period'=>$period,'co_class'=>$coClass,'risk_level'=>$riskLevel]) }}"
               class="btn btn-secondary" style="display:flex;align-items:center;gap:8px;border-color:rgba(239,68,68,0.3);color:#ff8888;background:rgba(239,68,68,0.1);" target="_blank">
                <i class="fa-solid fa-file-pdf"></i> Export PDF
            </a>
            <a href="{{ route('laporan.export', ['period'=>$period,'co_class'=>$coClass,'risk_level'=>$riskLevel]) }}"
               class="btn btn-primary" style="display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-file-excel"></i> Export Excel
            </a>
        </div>
    </form>
</div>

{{-- Summary Stats --}}
<div class="metrics-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:1.5rem;">
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#00f0ff"><i class="fa-solid fa-database"></i></div>
        <div>
            <span class="metric-label">Total DB</span>
            <div class="metric-value-container"><span class="metric-value">{{ number_format($summaryStats['total']) }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#ef4444"><i class="fa-solid fa-radiation"></i></div>
        <div>
            <span class="metric-label">High Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#ef4444">{{ number_format($summaryStats['high']) }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#f59e0b"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div>
            <span class="metric-label">Medium Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#f59e0b">{{ number_format($summaryStats['medium']) }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#10b981"><i class="fa-solid fa-shield-halved"></i></div>
        <div>
            <span class="metric-label">Low Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#10b981">{{ number_format($summaryStats['low']) }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card">
        <div class="metric-icon-box" style="color:#8b5cf6"><i class="fa-solid fa-gauge-high"></i></div>
        <div>
            <span class="metric-label">Avg Skor</span>
            <div class="metric-value-container"><span class="metric-value">{{ $summaryStats['avg_score'] }}</span></div>
            <span style="font-size:0.7rem;color:var(--text-muted);">Avg DTI: {{ $summaryStats['avg_dti'] }}%</span>
        </div>
    </div>
</div>

<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    {{-- By CO Class --}}
    <div class="glass-card col-4">
        <h3 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Distribusi per CO</h3>
        <div class="table-container">
            <table class="custom-table">
                <thead><tr><th>CO</th><th>High</th><th>Med</th><th>Low</th></tr></thead>
                <tbody>
                    @foreach($byCoClass as $coKey => $rows)
                    <tr>
                        <td><span class="badge badge-status" style="font-size:0.72rem;">{{ $coKey }}</span></td>
                        <td style="color:#ef4444;font-weight:600;">{{ $rows->firstWhere('risk_level','High')?->cnt ?? 0 }}</td>
                        <td style="color:#f59e0b;font-weight:600;">{{ $rows->firstWhere('risk_level','Medium')?->cnt ?? 0 }}</td>
                        <td style="color:#10b981;font-weight:600;">{{ $rows->firstWhere('risk_level','Low')?->cnt ?? 0 }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- By Payment Pattern --}}
    <div class="glass-card col-4">
        <h3 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Pola Bayar</h3>
        <div class="table-container">
            <table class="custom-table">
                <thead><tr><th>Pola</th><th>Jumlah</th><th>Avg Score</th></tr></thead>
                <tbody>
                    @foreach($byPattern as $row)
                    <tr>
                        <td><span class="badge badge-status" style="font-size:0.72rem;">{{ $row->payment_pattern }}</span></td>
                        <td style="font-weight:600;">{{ $row->cnt }}</td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ round($row->avg_score,2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- By PS AMBC --}}
    <div class="glass-card col-4">
        <h3 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">PS AMBC</h3>
        <div class="table-container">
            <table class="custom-table">
                <thead><tr><th>PS</th><th>Jumlah</th><th>Avg Score</th></tr></thead>
                <tbody>
                    @foreach($byPsAmbc as $row)
                    <tr>
                        <td><span class="badge badge-status" style="font-size:0.72rem;">{{ $row->ps_ambc }}</span></td>
                        <td style="font-weight:600;">{{ $row->cnt }}</td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ round($row->avg_score,2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Main Data Table --}}
<div class="glass-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:10px;">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Data Debitur ({{ $populations->total() }} baris)</h3>
        <div style="display:flex;gap:10px;">
            <span style="font-size:0.8rem;color:var(--text-muted);align-self:center;">
                Preview: {{ $populations->firstItem() ?? 0 }}–{{ $populations->lastItem() ?? 0 }} dari {{ $populations->total() }}
            </span>
        </div>
    </div>
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr>
                    <th>#</th><th>Nama</th><th>Usia</th><th>DTI%</th><th>Delay</th>
                    <th>Kredit</th><th>Beban CO%</th><th>Skor</th><th>Risk</th>
                    <th>Status</th><th>CO</th><th>Pola</th><th>PS</th><th>Periode</th>
                </tr>
            </thead>
            <tbody>
                @forelse($populations as $i => $pop)
                <tr>
                    <td style="color:var(--text-muted);font-size:0.78rem;">{{ $populations->firstItem() + $i }}</td>
                    <td style="font-weight:600;font-size:0.85rem;">{{ $pop->name }}</td>
                    <td style="font-size:0.82rem;">{{ $pop->age }}</td>
                    <td style="font-size:0.82rem;">{{ $pop->dti }}%</td>
                    <td style="font-size:0.82rem;color:{{ $pop->payment_delay > 90 ? '#ef4444' : 'inherit' }}">{{ $pop->payment_delay }}</td>
                    <td style="font-size:0.82rem;">{{ $pop->credit_score }}</td>
                    <td style="font-size:0.82rem;">{{ $pop->co_burden }}%</td>
                    <td style="font-weight:700;font-family:var(--font-display);">{{ round($pop->risk_score,2) }}</td>
                    <td>
                        <span class="badge badge-{{ strtolower($pop->risk_level) }}" style="font-size:0.65rem;">{{ $pop->risk_level }}</span>
                    </td>
                    <td style="font-size:0.78rem;">{{ $pop->status }}</td>
                    <td style="font-size:0.78rem;">{{ $pop->co_class }}</td>
                    <td style="font-size:0.78rem;">{{ $pop->payment_pattern }}</td>
                    <td style="font-size:0.78rem;">{{ $pop->ps_ambc }}</td>
                    <td style="font-size:0.78rem;">{{ $pop->period }}</td>
                </tr>
                @empty
                <tr><td colspan="14" style="text-align:center;color:var(--text-muted);padding:2rem;">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($populations->hasPages())
    <div class="pagination-container">
        <div class="pagination-info">Halaman {{ $populations->currentPage() }} dari {{ $populations->lastPage() }}</div>
        <div class="pagination-links">
            @if($populations->onFirstPage()) <span>&laquo;</span> @else <a href="{{ $populations->previousPageUrl() }}">&laquo;</a> @endif
            @foreach($populations->getUrlRange(max(1,$populations->currentPage()-2), min($populations->lastPage(),$populations->currentPage()+2)) as $page => $url)
                @if($page == $populations->currentPage()) <span class="active">{{ $page }}</span>
                @else <a href="{{ $url }}">{{ $page }}</a> @endif
            @endforeach
            @if($populations->hasMorePages()) <a href="{{ $populations->nextPageUrl() }}">&raquo;</a> @else <span>&raquo;</span> @endif
        </div>
    </div>
    @endif
</div>
@endsection
