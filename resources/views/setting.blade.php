@extends('layouts.layout')

@section('title', 'Pengaturan')
@section('header_title', 'Pengaturan Sistem')
@section('header_subtitle', 'Kelola ambang batas klasifikasi risiko kredit debitur secara global.')

@section('content')
<div class="dashboard-grid">
    <div class="glass-card col-6">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1.5rem;">
            <i class="fa-solid fa-sliders" style="color:#8b5cf6;margin-right:8px;"></i>Ambang Batas Skor Risiko
        </h3>
        
        <form action="{{ route('settings.update') }}" method="POST">
            @csrf
            
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;display:flex;flex-direction:column;gap:1.5rem;">
                
                {{-- Threshold Low -> Medium --}}
                <div style="display:flex;flex-direction:column;gap:8px;">
                    <label for="risk_low_threshold" style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">
                        Ambang Batas Low ke Medium Risk
                    </label>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <input type="range" id="slider_low" class="form-range" min="0" max="100" step="1" value="{{ $lowThreshold }}" style="flex:1;accent-color:#2563eb;" oninput="updateLowInput(this.value)">
                        <input type="number" name="risk_low_threshold" id="input_low" class="form-control" min="0" max="100" step="1" value="{{ $lowThreshold }}" style="width:80px;text-align:center;font-weight:700;font-family:var(--font-display);" oninput="updateLowSlider(this.value)">
                    </div>
                    <span style="font-size:0.75rem;color:var(--text-muted);">
                        Debitur dengan skor di bawah nilai ini akan diklasifikasikan sebagai <strong>Low Risk (Aman)</strong>. Di atas nilai ini diklasifikasikan sebagai <strong>Medium Risk</strong>.
                    </span>
                </div>

                {{-- Threshold Medium -> High --}}
                <div style="display:flex;flex-direction:column;gap:8px;">
                    <label for="risk_medium_threshold" style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">
                        Ambang Batas Medium ke High Risk
                    </label>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <input type="range" id="slider_medium" class="form-range" min="0" max="100" step="1" value="{{ $mediumThreshold }}" style="flex:1;accent-color:#f59e0b;" oninput="updateMediumInput(this.value)">
                        <input type="number" name="risk_medium_threshold" id="input_medium" class="form-control" min="0" max="100" step="1" value="{{ $mediumThreshold }}" style="width:80px;text-align:center;font-weight:700;font-family:var(--font-display);" oninput="updateMediumSlider(this.value)">
                    </div>
                    <span style="font-size:0.75rem;color:var(--text-muted);">
                        Debitur dengan skor di atas nilai ini akan diklasifikasikan sebagai <strong>High Risk (Berbahaya)</strong>.
                    </span>
                </div>

            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.75rem;color:#f59e0b;max-width:320px;line-height:1.4;">
                    <i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i> 
                    Mengubah ambang batas ini akan memicu kalkulasi ulang tingkat risiko otomatis untuk seluruh data populasi.
                </span>
                <button type="submit" class="btn btn-primary" style="display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-floppy-disk"></i> Simpan & Terapkan
                </button>
            </div>
        </form>
    </div>

    {{-- System Status Card --}}
    <div class="glass-card col-6" style="display:flex;flex-direction:column;gap:1.5rem;">
        <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
            <i class="fa-solid fa-circle-nodes" style="color:#00f0ff;margin-right:8px;"></i>Status & Info Sistem
        </h3>

        <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="font-size:0.85rem;font-weight:600;display:block;">Skema Pembagian Tingkat Risiko</span>
                    <span style="font-size:0.75rem;color:var(--text-muted);">Visualisasi rentang klasifikasi skor risiko saat ini</span>
                </div>
            </div>
            
            <div style="height:36px;border-radius:8px;overflow:hidden;display:flex;font-family:var(--font-display);font-size:0.8rem;font-weight:700;color:#fff;text-align:center;line-height:36px;box-shadow:0 8px 32px 0 rgba(0,0,0,0.37);">
                <div id="bar_low" style="background:#10b981;width:{{ $lowThreshold }}%;transition:width 0.3s ease;">
                    Low (<span id="txt_low">{{ $lowThreshold }}</span>)
                </div>
                <div id="bar_med" style="background:#f59e0b;width:{{ $mediumThreshold - $lowThreshold }}%;transition:width 0.3s ease;">
                    Medium
                </div>
                <div id="bar_high" style="background:#ef4444;width:{{ 100 - $mediumThreshold }}%;transition:width 0.3s ease;">
                    High (<span id="txt_med">{{ $mediumThreshold }}</span>)
                </div>
            </div>

            <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:0.5rem;display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Versi Aplikasi</span>
                    <span style="font-weight:700;font-size:0.85rem;color:#00f0ff;">v2.0-Stable</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Laravel Engine</span>
                    <span style="font-weight:600;font-size:0.85rem;">v12.x</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Database Driver</span>
                    <span style="font-weight:600;font-size:0.85rem;">MySQL 8.4.3</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Waktu Server</span>
                    <span style="font-weight:600;font-size:0.85rem;color:var(--text-muted);">{{ now()->format('d M Y H:i:s') }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function updateLowInput(val) {
    document.getElementById('input_low').value = val;
    adjustVisualization();
}

function updateLowSlider(val) {
    let num = Math.min(Math.max(parseInt(val) || 0, 0), 100);
    document.getElementById('slider_low').value = num;
    adjustVisualization();
}

function updateMediumInput(val) {
    document.getElementById('input_medium').value = val;
    adjustVisualization();
}

function updateMediumSlider(val) {
    let num = Math.min(Math.max(parseInt(val) || 0, 0), 100);
    document.getElementById('slider_medium').value = num;
    adjustVisualization();
}

function adjustVisualization() {
    const lowVal = Math.min(Math.max(parseInt(document.getElementById('input_low').value) || 0, 0), 100);
    const medVal = Math.min(Math.max(parseInt(document.getElementById('input_medium').value) || 0, 0), 100);
    
    document.getElementById('txt_low').innerText = lowVal;
    document.getElementById('txt_med').innerText = medVal;

    if (lowVal < medVal) {
        document.getElementById('bar_low').style.width = lowVal + '%';
        document.getElementById('bar_med').style.width = (medVal - lowVal) + '%';
        document.getElementById('bar_high').style.width = (100 - medVal) + '%';
    }
}
</script>
@endsection
