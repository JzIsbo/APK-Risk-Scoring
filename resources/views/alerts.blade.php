@extends('layouts.layout')

@section('title', 'Alert & Notifikasi')
@section('header_title', 'Alert & Notifikasi')
@section('header_subtitle', 'Sistem peringatan otomatis berbasis analisis real-time data risiko debitur.')

@section('content')
{{-- Alert Summary Cards --}}
<div class="metrics-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:1.5rem;">
    <div class="glass-card metric-card" style="border-left:3px solid #ef4444;">
        <div class="metric-icon-box" style="color:#ef4444"><i class="fa-solid fa-radiation"></i></div>
        <div>
            <span class="metric-label">High Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#ef4444">{{ $totalHigh }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card" style="border-left:3px solid #f59e0b;">
        <div class="metric-icon-box" style="color:#f59e0b"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div>
            <span class="metric-label">Medium Risk</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#f59e0b">{{ $totalMedium }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card" style="border-left:3px solid #ef4444;">
        <div class="metric-icon-box" style="color:#f59e0b"><i class="fa-solid fa-clock"></i></div>
        <div>
            <span class="metric-label">Delay &gt;90 Hari</span>
            <div class="metric-value-container"><span class="metric-value" style="color:#f59e0b">{{ $totalDelay90 }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card" style="border-left:3px solid #f59e0b;">
        <div class="metric-icon-box" style="color:#f59e0b"><i class="fa-solid fa-chart-pie"></i></div>
        <div>
            <span class="metric-label">DTI &gt;70%</span>
            <div class="metric-value-container"><span class="metric-value">{{ $totalHighDti }}</span></div>
        </div>
    </div>
    <div class="glass-card metric-card" style="border-left:3px solid rgba(255,255,255,0.1);">
        <div class="metric-icon-box" style="color:var(--text-secondary)"><i class="fa-solid fa-ban"></i></div>
        <div>
            <span class="metric-label">No Order</span>
            <div class="metric-value-container"><span class="metric-value">{{ $totalNoOrder }}</span></div>
        </div>
    </div>
</div>

<div class="dashboard-grid" style="margin-bottom:1.5rem;align-items:start;">
    {{-- Alerts List --}}
    <div class="col-8" style="display:flex;flex-direction:column;gap:1rem;">
        <div class="glass-card" style="padding:1.25rem 1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Notifikasi Sistem</h3>
                <form action="{{ route('alerts.mark-all-read') }}" method="POST" style="display:inline;">
                    @csrf
                    <button type="submit" class="btn btn-secondary" style="font-size:0.78rem;padding:6px 12px;">
                        <i class="fa-solid fa-check-double"></i> Tandai Semua Dibaca
                    </button>
                </form>
            </div>
        </div>

        {{-- Critical Alerts --}}
        @if(count($critical) > 0)
        <div style="display:flex;flex-direction:column;gap:10px;">
            <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;padding-left:4px;">🔴 Critical</span>
            @foreach($critical as $alert)
            <div class="glass-card alert-item" style="padding:1.25rem;border-left:3px solid #ef4444;{{ !$alert['read'] ? 'background:rgba(239,68,68,0.05);' : '' }}">
                <div style="display:flex;align-items:flex-start;gap:14px;">
                    <div style="width:40px;height:40px;background:rgba(239,68,68,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fa-solid {{ $alert['icon'] }}" style="color:#ef4444;font-size:1rem;"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                            <span style="font-weight:700;font-size:0.9rem;">{{ $alert['title'] }}</span>
                            <span style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;margin-left:12px;">{{ $alert['time'] }}</span>
                        </div>
                        <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:10px;">{{ $alert['message'] }}</p>
                        <a href="{{ $alert['action_url'] }}" class="btn btn-secondary" style="font-size:0.78rem;padding:5px 12px;border-color:rgba(239,68,68,0.3);">
                            {{ $alert['action_label'] }} <i class="fa-solid fa-arrow-right" style="margin-left:4px;"></i>
                        </a>
                    </div>
                    @if(!$alert['read'])
                    <div style="width:8px;height:8px;background:#ef4444;border-radius:50%;flex-shrink:0;margin-top:4px;"></div>
                    @endif
                </div>
            </div>
            @endforeach
        </div>
        @endif

        {{-- Warning Alerts --}}
        @if(count($warning) > 0)
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:0.5rem;">
            <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;padding-left:4px;">🟡 Warning</span>
            @foreach($warning as $alert)
            <div class="glass-card alert-item" style="padding:1.25rem;border-left:3px solid #f59e0b;{{ !$alert['read'] ? 'background:rgba(245,158,11,0.04);' : '' }}">
                <div style="display:flex;align-items:flex-start;gap:14px;">
                    <div style="width:40px;height:40px;background:rgba(245,158,11,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fa-solid {{ $alert['icon'] }}" style="color:#f59e0b;font-size:1rem;"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                            <span style="font-weight:700;font-size:0.9rem;">{{ $alert['title'] }}</span>
                            <span style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;margin-left:12px;">{{ $alert['time'] }}</span>
                        </div>
                        <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:10px;">{{ $alert['message'] }}</p>
                        <a href="{{ $alert['action_url'] }}" class="btn btn-secondary" style="font-size:0.78rem;padding:5px 12px;">
                            {{ $alert['action_label'] }} <i class="fa-solid fa-arrow-right" style="margin-left:4px;"></i>
                        </a>
                    </div>
                    @if(!$alert['read'])
                    <div style="width:8px;height:8px;background:#f59e0b;border-radius:50%;flex-shrink:0;margin-top:4px;"></div>
                    @endif
                </div>
            </div>
            @endforeach
        </div>
        @endif

        {{-- Info Alerts --}}
        @if(count($info) > 0)
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:0.5rem;">
            <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;padding-left:4px;">🔵 Info</span>
            @foreach($info as $alert)
            <div class="glass-card alert-item" style="padding:1.25rem;border-left:3px solid #2563eb;opacity:{{ $alert['read'] ? '0.7' : '1' }};">
                <div style="display:flex;align-items:flex-start;gap:14px;">
                    <div style="width:40px;height:40px;background:rgba(37,99,235,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fa-solid {{ $alert['icon'] }}" style="color:#2563eb;font-size:1rem;"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                            <span style="font-weight:700;font-size:0.9rem;">{{ $alert['title'] }}</span>
                            <span style="font-size:0.7rem;color:var(--text-muted);">{{ $alert['time'] }}</span>
                        </div>
                        <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:10px;">{{ $alert['message'] }}</p>
                        <a href="{{ $alert['action_url'] }}" class="btn btn-secondary" style="font-size:0.78rem;padding:5px 12px;">
                            {{ $alert['action_label'] }} <i class="fa-solid fa-arrow-right" style="margin-left:4px;"></i>
                        </a>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @endif

        @if(count($alerts) === 0)
        <div class="glass-card" style="text-align:center;padding:3rem;color:var(--text-muted);">
            <i class="fa-solid fa-bell-slash" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>
            Tidak ada notifikasi saat ini. Semua sistem berjalan normal.
        </div>
        @endif
    </div>

    {{-- Right Panel --}}
    <div class="col-4" style="display:flex;flex-direction:column;gap:1rem;">
        {{-- High Risk Debtors --}}
        <div class="glass-card">
            <h4 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;color:#ef4444;">
                <i class="fa-solid fa-radiation" style="margin-right:6px;"></i>Top High Risk
            </h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
                @forelse($highRiskDebtors->take(6) as $d)
                <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(239,68,68,0.05);border-radius:8px;border:1px solid rgba(239,68,68,0.1);">
                    <div style="flex:1;overflow:hidden;">
                        <div style="font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $d->name }}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">{{ $d->co_class }} · {{ $d->period }}</div>
                    </div>
                    <span style="font-weight:800;font-family:var(--font-display);color:#ef4444;font-size:0.9rem;">{{ round($d->risk_score,1) }}</span>
                </div>
                @empty
                <p style="color:var(--text-muted);font-size:0.82rem;">Tidak ada High Risk.</p>
                @endforelse
            </div>
        </div>

        {{-- Severe Delay --}}
        <div class="glass-card">
            <h4 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;color:#f59e0b;">
                <i class="fa-solid fa-clock" style="margin-right:6px;"></i>Delay &gt;90 Hari
            </h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
                @forelse($severeDelay->take(5) as $d)
                <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(245,158,11,0.05);border-radius:8px;border:1px solid rgba(245,158,11,0.1);">
                    <div style="flex:1;overflow:hidden;">
                        <div style="font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ $d->name }}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">{{ $d->co_class }}</div>
                    </div>
                    <span style="font-weight:700;color:#f59e0b;font-size:0.85rem;">{{ $d->payment_delay }}h</span>
                </div>
                @empty
                <p style="color:var(--text-muted);font-size:0.82rem;">Tidak ada delay ekstrem.</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
