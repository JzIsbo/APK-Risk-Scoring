@extends('layouts.layout')

@section('title', 'Data Master')
@section('header_title', 'Data Master')
@section('header_subtitle', 'Kelola referensi data master yang digunakan dalam sistem scoring risiko.')

@section('content')
<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    {{-- Kelas CO --}}
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-layer-group" style="color:#00f0ff;margin-right:8px;"></i>Kelas CO (Prioritas)
            </h3>
        </div>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr><th>Kode</th><th>Total Debitur</th><th>High Risk</th><th>Avg Skor</th><th>Status</th></tr>
                </thead>
                <tbody>
                    @foreach($coClasses as $class)
                    @php $s = $coStats[$class]; @endphp
                    <tr>
                        <td>
                            <span class="badge badge-status" style="font-size:0.8rem;padding:5px 14px;">{{ $class }}</span>
                        </td>
                        <td style="font-weight:600;">{{ number_format($s['total']) }}</td>
                        <td><span style="color:#ef4444;font-weight:600;">{{ $s['high'] }}</span></td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ $s['avg_score'] }}</td>
                        <td>
                            <div style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;margin-right:6px;"></div>
                            <span style="font-size:0.8rem;color:var(--text-secondary);">Aktif</span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- Pola Bayar --}}
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-receipt" style="color:#f59e0b;margin-right:8px;"></i>Pola Bayar Akhir
            </h3>
        </div>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr><th>Kode</th><th>Total Debitur</th><th>High Risk</th><th>Avg Delay (Hari)</th><th>Status</th></tr>
                </thead>
                <tbody>
                    @foreach($paymentPatterns as $pattern)
                    @php $s = $patternStats[$pattern]; @endphp
                    <tr>
                        <td>
                            <span class="badge badge-status" style="font-size:0.8rem;padding:5px 14px;">{{ $pattern }}</span>
                        </td>
                        <td style="font-weight:600;">{{ number_format($s['total']) }}</td>
                        <td><span style="color:#ef4444;font-weight:600;">{{ $s['high'] }}</span></td>
                        <td style="color:{{ $s['avg_delay'] > 60 ? '#ef4444' : ($s['avg_delay'] > 30 ? '#f59e0b' : '#10b981') }};font-weight:600;">
                            {{ $s['avg_delay'] }}
                        </td>
                        <td>
                            <div style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;margin-right:6px;"></div>
                            <span style="font-size:0.8rem;color:var(--text-secondary);">Aktif</span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    {{-- PS AMBC --}}
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-tags" style="color:#8b5cf6;margin-right:8px;"></i>PS AMBC
            </h3>
        </div>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr><th>Kode</th><th>Total Debitur</th><th>High Risk</th><th>Avg Skor</th><th>Status</th></tr>
                </thead>
                <tbody>
                    @foreach($psAmbcClasses as $ps)
                    @php $s = $psStats[$ps]; @endphp
                    <tr>
                        <td>
                            <span class="badge badge-status" style="font-size:0.8rem;padding:5px 14px;">{{ $ps }}</span>
                        </td>
                        <td style="font-weight:600;">{{ number_format($s['total']) }}</td>
                        <td><span style="color:#ef4444;font-weight:600;">{{ $s['high'] }}</span></td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ $s['avg_score'] }}</td>
                        <td>
                            <div style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;margin-right:6px;"></div>
                            <span style="font-size:0.8rem;color:var(--text-secondary);">Aktif</span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- Status --}}
    <div class="glass-card col-6">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-circle-check" style="color:#10b981;margin-right:8px;"></i>Status Debitur
            </h3>
        </div>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr><th>Status</th><th>Total Debitur</th><th>High Risk</th><th>Avg Skor</th><th>Status</th></tr>
                </thead>
                <tbody>
                    @foreach($statuses as $status)
                    @php $s = $statusStats[$status]; @endphp
                    <tr>
                        <td>
                            <span class="badge badge-status" style="font-size:0.8rem;padding:5px 14px;">{{ $status }}</span>
                        </td>
                        <td style="font-weight:600;">{{ number_format($s['total']) }}</td>
                        <td><span style="color:#ef4444;font-weight:600;">{{ $s['high'] }}</span></td>
                        <td style="font-family:var(--font-display);font-weight:700;">{{ $s['avg_score'] }}</td>
                        <td>
                            <div style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;margin-right:6px;"></div>
                            <span style="font-size:0.8rem;color:var(--text-secondary);">Aktif</span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Period Stats --}}
<div class="glass-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
            <i class="fa-solid fa-calendar-days" style="color:#3b82f6;margin-right:8px;"></i>Data per Periode
        </h3>
    </div>
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr><th>Periode</th><th>Total Debitur</th><th>High Risk</th><th>Avg Skor Risiko</th><th>% High Risk</th></tr>
            </thead>
            <tbody>
                @forelse($periodStats as $ps)
                @php $pct = $ps->total > 0 ? round(($ps->high_count / $ps->total) * 100, 1) : 0; @endphp
                <tr>
                    <td style="font-weight:600;">{{ $ps->period }}</td>
                    <td style="font-weight:600;">{{ number_format($ps->total) }}</td>
                    <td><span style="color:#ef4444;font-weight:600;">{{ number_format($ps->high_count) }}</span></td>
                    <td style="font-family:var(--font-display);font-weight:700;">{{ round($ps->avg_score, 2) }}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="flex:1;background:rgba(255,255,255,0.07);border-radius:4px;height:6px;min-width:80px;">
                                <div style="height:100%;width:{{ $pct }}%;background:{{ $pct >= 30 ? '#ef4444' : ($pct >= 15 ? '#f59e0b' : '#10b981') }};border-radius:4px;"></div>
                            </div>
                            <span style="font-size:0.82rem;font-weight:600;">{{ $pct }}%</span>
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">Tidak ada data periode.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
