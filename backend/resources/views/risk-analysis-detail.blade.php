@extends('layouts.layout')

@section('title', 'Detail Risiko - ' . $population->name)
@section('header_title', 'Detail Analisis Risiko')
@section('header_subtitle', 'Profil risiko lengkap dan breakdown parameter scoring untuk debitur.')

@section('content')
<div style="margin-bottom:1rem;">
    <a href="{{ route('risk-analysis.index') }}" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;">
        <i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i>Kembali ke Risk Analysis
    </a>
</div>

<div class="dashboard-grid" style="margin-bottom:1.5rem;">
    {{-- Profile Card --}}
    <div class="glass-card col-4">
        <div style="text-align:center;padding:1rem 0 0.5rem;">
            <div style="width:72px;height:72px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.8rem;font-weight:700;">
                {{ strtoupper(substr($population->name, 0, 1)) }}
            </div>
            <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:4px;">{{ $population->name }}</h2>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:1rem;">
                <span class="badge badge-status" style="font-size:0.7rem;">{{ $population->co_class }}</span>
                <span class="badge badge-status" style="font-size:0.7rem;">{{ $population->payment_pattern }}</span>
                <span class="badge badge-status" style="font-size:0.7rem;">{{ $population->ps_ambc }}</span>
            </div>
        </div>

        <div style="border-top:1px solid var(--border-color);padding-top:1rem;display:flex;flex-direction:column;gap:10px;">
            @php
                $riskColor = $population->risk_level === 'High' ? '#ef4444' : ($population->risk_level === 'Medium' ? '#f59e0b' : '#10b981');
            @endphp
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:var(--text-secondary);font-size:0.85rem;">Skor Risiko</span>
                <span style="font-size:1.6rem;font-weight:800;font-family:var(--font-display);color:{{ $riskColor }};">{{ round($population->risk_score, 2) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:var(--text-secondary);font-size:0.85rem;">Tingkat Risiko</span>
                <span class="badge badge-{{ strtolower($population->risk_level) }}">{{ $population->risk_level }}</span>
            </div>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;height:8px;margin:4px 0;">
                <div style="height:100%;width:{{ min($population->risk_score,100) }}%;background:{{ $riskColor }};border-radius:8px;transition:width 0.8s ease;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);">
                <span>0 (Aman)</span><span>100 (Berbahaya)</span>
            </div>
        </div>

        <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:0.5rem;display:flex;flex-direction:column;gap:8px;">
            @foreach([['Usia','age','th'],['Status','status',''],['Periode','period','']] as [$lbl,$key,$unit])
            <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-secondary);font-size:0.82rem;">{{ $lbl }}</span>
                <span style="font-weight:600;font-size:0.85rem;">{{ $population->$key }} {{ $unit }}</span>
            </div>
            @endforeach
        </div>
    </div>

    {{-- Parameter Breakdown --}}
    <div class="glass-card col-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Breakdown Parameter Scoring</h3>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            @foreach($breakdown as $b)
            @php $contrib = $b['contribution']; $maxContrib = $b['weight']; $pct = $maxContrib > 0 ? min(($contrib/$maxContrib)*100,100) : 0; @endphp
            <div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div>
                        <span style="font-size:0.85rem;font-weight:600;">{{ $b['name'] }}</span>
                        <span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;">Bobot: {{ $b['weight'] }}%</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.78rem;color:var(--text-secondary);">Nilai: <strong>{{ $b['value'] }}</strong></div>
                        <div style="font-size:0.72rem;color:var(--text-muted);">Kontribusi: <span style="color:#fff;font-weight:600;">{{ $b['contribution'] }}</span></div>
                    </div>
                </div>
                <div style="background:rgba(255,255,255,0.07);border-radius:4px;height:5px;">
                    <div style="height:100%;width:{{ $pct }}%;background:linear-gradient(90deg,#2563eb,#7c3aed);border-radius:4px;"></div>
                </div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">Skor: {{ $b['score'] }}</div>
            </div>
            @endforeach
        </div>
    </div>

    {{-- Radar Chart --}}
    <div class="glass-card col-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Profil Risiko</h3>
        </div>
        <div style="height:250px;display:flex;align-items:center;justify-content:center;">
            <canvas id="chartRadarBreakdown"></canvas>
        </div>

        <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:1rem;display:flex;flex-direction:column;gap:8px;">
            @foreach([['DTI','dti','%'],['Keterlambatan','payment_delay',' hari'],['Skor Kredit','credit_score',''],['Beban CO','co_burden','%']] as [$lbl,$key,$unit])
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:var(--text-secondary);font-size:0.8rem;">{{ $lbl }}</span>
                <span style="font-weight:600;font-size:0.85rem;">{{ $population->$key }}{{ $unit }}</span>
            </div>
            @endforeach
        </div>
    </div>
</div>

{{-- Similar Debtors --}}
@if($similar->count() > 0)
<div class="glass-card">
    <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Debitur Serupa ({{ $population->risk_level }} Risk)</h3>
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr><th>Nama</th><th>CO / Period</th><th>Skor Risiko</th><th>DTI %</th><th>Keterlambatan</th><th>Status</th><th>Detail</th></tr>
            </thead>
            <tbody>
                @foreach($similar as $s)
                <tr>
                    <td style="font-weight:600;">{{ $s->name }}</td>
                    <td><span class="badge badge-status" style="font-size:0.65rem;">{{ $s->co_class }}</span> <span style="font-size:0.7rem;color:var(--text-muted);">{{ $s->period }}</span></td>
                    <td style="font-weight:700;font-family:var(--font-display);">{{ round($s->risk_score,2) }}</td>
                    <td>{{ $s->dti }}%</td>
                    <td>{{ $s->payment_delay }} hari</td>
                    <td>{{ $s->status }}</td>
                    <td><a href="{{ route('risk-analysis.show', $s->id) }}" class="btn btn-secondary btn-sm"><i class="fa-solid fa-eye"></i></a></td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endif
@endsection

@section('scripts')
<script>
const radarLabelsRaw = @json(array_column($breakdown, 'name'));
const labelMapping = {
    'Rasio Utang (Debt to Income - DTI)': 'DTI',
    'Keterlambatan Pembayaran (Hari)': 'Keterlambatan',
    'Skor Kredit': 'Skor Kredit',
    'Usia Debitur': 'Usia',
    'Rasio Beban CO (%)': 'Beban CO'
};
const radarLabels = radarLabelsRaw.map(name => labelMapping[name] || name);
const radarScores = @json(array_column($breakdown, 'score'));

new Chart(document.getElementById('chartRadarBreakdown').getContext('2d'), {
    type: 'radar',
    data: {
        labels: radarLabels,
        datasets: [{
            label: '{{ $population->name }}',
            data: radarScores,
            backgroundColor: 'rgba(37,99,235,0.25)',
            borderColor: '#2563eb',
            borderWidth: 2,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 30,
                right: 30
            }
        },
        plugins: { legend: { display: false }},
        scales: {
            r: {
                angleLines: { color: 'rgba(255,255,255,0.08)' },
                grid: { color: 'rgba(255,255,255,0.08)' },
                pointLabels: {
                    color: '#8e9bb4',
                    font: { size: 9, family: 'Plus Jakarta Sans' },
                    padding: 8
                },
                ticks: { display: false },
                min: 0,
                max: 100
            }
        }
    }
});
</script>
@endsection
