@extends('layouts.layout')

@section('title', 'Dashboard')
@section('header_title', 'Dashboard Pemantauan Risiko')
@section('header_subtitle', 'Selamat datang, ' . auth()->user()->name . '! Berikut ringkasan data risiko real-time terbaru.')

@section('content')
<!-- KPI Metrics Grid -->
<div class="metrics-grid">
    <!-- Total Populasi -->
    <div class="glass-card metric-card card-total-populasi">
        <div class="metric-icon-box" style="color: var(--color-cyan)">
            <i class="fa-solid fa-users"></i>
        </div>
        <div>
            <span class="metric-label">Total Populasi</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($totalPopulation) }}</span>
                <span class="metric-change {{ $changes['total']['dir'] }}">
                    <i class="fa-solid fa-caret-{{ $changes['total']['dir'] }}"></i> 
                    {{ $changes['total']['dir'] == 'up' ? '+' : '-' }}{{ $changes['total']['val'] }}%
                </span>
            </div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">{{ $changes['compare_label'] }}</span>
        </div>
    </div>

    <!-- Populasi Risk -->
    <div class="glass-card metric-card card-populasi-risk">
        <div class="metric-icon-box" style="color: var(--color-medium)">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
            <span class="metric-label">Populasi Risk</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($riskPopulation) }}</span>
                <span class="metric-change {{ $changes['risk']['dir'] }}">
                    <i class="fa-solid fa-caret-{{ $changes['risk']['dir'] }}"></i> 
                    {{ $changes['risk']['dir'] == 'up' ? '+' : '-' }}{{ $changes['risk']['val'] }}%
                </span>
            </div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">{{ $changes['compare_label'] }}</span>
        </div>
    </div>

    <!-- High Risk -->
    <div class="glass-card metric-card card-high-risk">
        <div class="metric-icon-box" style="color: var(--color-high)">
            <i class="fa-solid fa-radiation"></i>
        </div>
        <div>
            <span class="metric-label">High Risk</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($highRisk) }}</span>
                <span class="metric-change {{ $changes['high']['dir'] }}">
                    <i class="fa-solid fa-caret-{{ $changes['high']['dir'] }}"></i> 
                    {{ $changes['high']['dir'] == 'up' ? '+' : '-' }}{{ $changes['high']['val'] }}%
                </span>
            </div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">{{ $changes['compare_label'] }}</span>
        </div>
    </div>

    <!-- Low Risk -->
    <div class="glass-card metric-card card-low-risk">
        <div class="metric-icon-box" style="color: var(--color-low)">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div>
            <span class="metric-label">Low Risk</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($lowRisk) }}</span>
                <span class="metric-change {{ $changes['low']['dir'] }}">
                    <i class="fa-solid fa-caret-{{ $changes['low']['dir'] }}"></i> 
                    {{ $changes['low']['dir'] == 'up' ? '+' : '-' }}{{ $changes['low']['val'] }}%
                </span>
            </div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">{{ $changes['compare_label'] }}</span>
        </div>
    </div>

    <!-- No Order -->
    <div class="glass-card metric-card card-no-order">
        <div class="metric-icon-box" style="color: var(--text-secondary)">
            <i class="fa-solid fa-ban"></i>
        </div>
        <div>
            <span class="metric-label">No Order</span>
            <div class="metric-value-container">
                <span class="metric-value">{{ number_format($noOrder) }}</span>
                <span class="metric-change {{ $changes['no_order']['dir'] }}">
                    <i class="fa-solid fa-caret-{{ $changes['no_order']['dir'] }}"></i> 
                    {{ $changes['no_order']['dir'] == 'up' ? '+' : '-' }}{{ $changes['no_order']['val'] }}%
                </span>
            </div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">{{ $changes['compare_label'] }}</span>
        </div>
    </div>
</div>

<!-- Charts Section Row 1 -->
<div class="dashboard-grid" style="margin-bottom: 1.5rem;">
    <!-- Populasi CO -->
    <div class="glass-card col-4">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Populasi CO</h3>
            <span style="font-size: 0.7rem; color: var(--text-muted);">{{ reset($periods) }} - {{ end($periods) }}</span>
        </div>
        <div style="position:relative; height: 220px; width: 100%;">
            <canvas id="chartPopulasiCo"></canvas>
        </div>
    </div>

    <!-- Populasi Beban CO -->
    <div class="glass-card col-5">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Rasio Beban CO (%)</h3>
            <span style="font-size: 0.7rem; color: var(--text-muted);">RATA-RATA BULANAN</span>
        </div>
        <div style="height: 220px;">
            <canvas id="chartBebanCo"></canvas>
        </div>
    </div>

    <!-- Populasi Risk Radar -->
    <div class="glass-card col-3">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Populasi Risk</h3>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Radar Analisis</span>
        </div>
        <div style="position:relative; height: 220px; width: 100%;">
            <canvas id="chartPopulasiRiskRadar"></canvas>
        </div>
    </div>
</div>

<!-- Charts Section Row 2 -->
<div class="dashboard-grid">
    <!-- Trend Prioritas -->
    <div class="glass-card col-3">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Trend Prioritas</h3>
            <span style="font-size: 0.65rem; color: var(--text-muted);">AMBC (SELESAI) / BULAN</span>
        </div>
        <div style="height: 180px;">
            <canvas id="chartTrendPrioritas"></canvas>
        </div>
    </div>

    <!-- Pola Bayar Akhir -->
    <div class="glass-card col-3">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Pola Bayar Akhir</h3>
            <span style="font-size: 0.65rem; color: var(--text-muted);">AMBC (SELESAI) / BULAN</span>
        </div>
        <div style="height: 180px;">
            <canvas id="chartPolaBayar"></canvas>
        </div>
    </div>

    <!-- PS AMBC -->
    <div class="glass-card col-3">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">PS AMBC (SELESAI)</h3>
            <span style="font-size: 0.65rem; color: var(--text-muted);">AC / BULAN</span>
        </div>
        <div style="height: 180px;">
            <canvas id="chartPsAmbc"></canvas>
        </div>
    </div>

    <!-- Populasi Risk - No Order -->
    <div class="glass-card col-3">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Populasi Risk - No Order</h3>
            <span style="font-size: 0.65rem; color: var(--text-muted);">{{ reset($periods) }} - {{ end($periods) }}</span>
        </div>
        <div style="height: 180px;">
            <canvas id="chartRiskNoOrder"></canvas>
        </div>
    </div>
</div>

<!-- Row 3: Matrix Diagram & Settings -->
<div class="dashboard-grid" style="margin-top: 1.5rem; margin-bottom: 1.5rem;">
    <!-- Matrix Diagram Card -->
    <div class="glass-card col-8">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
                <h3 style="font-size: 0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Matriks Analisis Risiko</h3>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Sumbu Y (Vertikal): <strong>{{ $matrixData['nameY'] }}</strong> &nbsp;|&nbsp; Sumbu X (Horizontal): <strong>{{ $matrixData['nameX'] }}</strong></span>
            </div>
            <span class="badge badge-status" style="font-size:0.68rem; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-table-cells-large"></i> 3 &times; 3 Heatmap
            </span>
        </div>

        <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px; align-items: center;">
            <!-- Y-Axis Labels Column -->
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 260px; font-weight: 700; font-size: 0.72rem; color: var(--text-secondary); text-align: right; padding-right: 12px; border-right: 1px solid var(--border-color);">
                <div style="height: 80px; display: flex; flex-direction: column; justify-content: center;">
                    <span style="color: var(--color-high);">HIGH</span>
                    <span style="font-size: 0.6rem; color: var(--text-muted); font-weight: normal;">(Tinggi)</span>
                </div>
                <div style="height: 80px; display: flex; flex-direction: column; justify-content: center;">
                    <span style="color: var(--color-medium);">MEDIUM</span>
                    <span style="font-size: 0.6rem; color: var(--text-muted); font-weight: normal;">(Sedang)</span>
                </div>
                <div style="height: 80px; display: flex; flex-direction: column; justify-content: center;">
                    <span style="color: var(--color-low);">LOW</span>
                    <span style="font-size: 0.6rem; color: var(--text-muted); font-weight: normal;">(Rendah)</span>
                </div>
            </div>

            <!-- 3x3 Heatmap Grid -->
            <div style="display: grid; grid-template-rows: repeat(3, 80px); gap: 10px;">
                <!-- Row 1: High Y -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; height: 80px;">
                    <!-- High Y, Low X (Orange/Medium) -->
                    <div class="matrix-cell" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'Medium']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; font-family: var(--font-display);">{{ $matrixData['grid']['High']['Low'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Medium Risk</span>
                    </div>
                    <!-- High Y, Medium X (Red/High) -->
                    <div class="matrix-cell" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'High']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #ef4444; font-family: var(--font-display);">{{ $matrixData['grid']['High']['Medium'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">High Risk</span>
                    </div>
                    <!-- High Y, High X (Red/High) -->
                    <div class="matrix-cell" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'High']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #ff5c5c; font-family: var(--font-display);">{{ $matrixData['grid']['High']['High'] }}</span>
                        <span style="font-size: 0.62rem; color: #ff8888; text-transform: uppercase; font-weight: 700;">Extreme Risk</span>
                    </div>
                </div>

                <!-- Row 2: Medium Y -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; height: 80px;">
                    <!-- Medium Y, Low X (Green/Low) -->
                    <div class="matrix-cell" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'Low']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #10b981; font-family: var(--font-display);">{{ $matrixData['grid']['Medium']['Low'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Low Risk</span>
                    </div>
                    <!-- Medium Y, Medium X (Orange/Medium) -->
                    <div class="matrix-cell" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'Medium']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; font-family: var(--font-display);">{{ $matrixData['grid']['Medium']['Medium'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Medium Risk</span>
                    </div>
                    <!-- Medium Y, High X (Red/High) -->
                    <div class="matrix-cell" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'High']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #ef4444; font-family: var(--font-display);">{{ $matrixData['grid']['Medium']['High'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">High Risk</span>
                    </div>
                </div>

                <!-- Row 3: Low Y -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; height: 80px;">
                    <!-- Low Y, Low X (Green/Low) -->
                    <div class="matrix-cell" style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'Low']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #10b981; font-family: var(--font-display);">{{ $matrixData['grid']['Low']['Low'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Safe (Low)</span>
                    </div>
                    <!-- Low Y, Medium X (Green/Low) -->
                    <div class="matrix-cell" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'Low']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #10b981; font-family: var(--font-display);">{{ $matrixData['grid']['Low']['Medium'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Low Risk</span>
                    </div>
                    <!-- Low Y, High X (Orange/Medium) -->
                    <div class="matrix-cell" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';" onclick="location.href='{{ route('risk-analysis.index', ['risk_level' => 'Medium']) }}'">
                        <span style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; font-family: var(--font-display);">{{ $matrixData['grid']['Low']['High'] }}</span>
                        <span style="font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Medium Risk</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- X-Axis Labels Row -->
        <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px; margin-top: 10px;">
            <div></div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; font-weight: 700; font-size: 0.72rem; color: var(--text-secondary);">
                <div>
                    <span>LOW</span>
                    <div style="font-size: 0.6rem; color: var(--text-muted); font-weight: normal;">(Rendah)</div>
                </div>
                <div>
                    <span>MEDIUM</span>
                    <div style="font-size: 0.6rem; color: var(--text-muted); font-weight: normal;">(Sedang)</div>
                </div>
                <div>
                    <span>HIGH</span>
                    <div style="font-size: 0.6rem; color: var(--text-muted); font-weight: normal;">(Tinggi)</div>
                </div>
            </div>
        </div>

        <!-- X-Axis Parameter Name Title -->
        <div style="text-align: center; margin-top: 15px; font-size: 0.82rem; font-weight: 600; color: var(--color-blue); text-transform: uppercase; letter-spacing: 0.5px;">
            Parameter Horizontal (X): <strong>{{ $matrixData['nameX'] }}</strong>
        </div>
    </div>

    <!-- Settings Card -->
    <div class="glass-card col-4">
        <h3 style="font-size: 0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom: 1.25rem;">
            <i class="fa-solid fa-sliders" style="color: var(--color-purple); margin-right: 6px;"></i> Pengaturan Matriks
        </h3>

        @if(session('success'))
        <div class="alert alert-success" style="padding: 8px 12px; font-size: 0.8rem; margin-bottom: 1rem; border-radius: 8px;">
            <i class="fa-solid fa-circle-check"></i> {{ session('success') }}
        </div>
        @endif

        <form action="{{ route('dashboard.update-matrix') }}" method="POST" style="display: flex; flex-direction: column; gap: 1rem;">
            @csrf
            
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Sumbu Y (Vertikal)</label>
                <select name="matrix_y_param" class="form-control form-select">
                    <option value="dti" {{ $matrixY === 'dti' ? 'selected' : '' }}>Rasio Utang (DTI)</option>
                    <option value="payment_delay" {{ $matrixY === 'payment_delay' ? 'selected' : '' }}>Keterlambatan Pembayaran</option>
                    <option value="credit_score" {{ $matrixY === 'credit_score' ? 'selected' : '' }}>Skor Kredit</option>
                    <option value="co_burden" {{ $matrixY === 'co_burden' ? 'selected' : '' }}>Beban CO</option>
                    <option value="age" {{ $matrixY === 'age' ? 'selected' : '' }}>Usia Debitur</option>
                </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Sumbu X (Horizontal)</label>
                <select name="matrix_x_param" class="form-control form-select">
                    <option value="dti" {{ $matrixX === 'dti' ? 'selected' : '' }}>Rasio Utang (DTI)</option>
                    <option value="payment_delay" {{ $matrixX === 'payment_delay' ? 'selected' : '' }}>Keterlambatan Pembayaran</option>
                    <option value="credit_score" {{ $matrixX === 'credit_score' ? 'selected' : '' }}>Skor Kredit</option>
                    <option value="co_burden" {{ $matrixX === 'co_burden' ? 'selected' : '' }}>Beban CO</option>
                    <option value="age" {{ $matrixX === 'age' ? 'selected' : '' }}>Usia Debitur</option>
                </select>
            </div>

            @if(auth()->user()->role === 'admin')
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 0.25rem;">
                <input type="checkbox" name="save_as_default" id="save_as_default" style="width: 16px; height: 16px; accent-color: var(--color-blue); cursor: pointer;">
                <label for="save_as_default" style="font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; user-select: none;">Simpan sebagai default sistem</label>
            </div>
            @endif

            <button type="submit" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 0.5rem; padding: 12px 20px;">
                <i class="fa-solid fa-rotate"></i> Terapkan & Segarkan
            </button>
        </form>
    </div>
</div>
@endsection

@section('scripts')
<script>
    // Theme options for Charts
    const gridStyle = {
        color: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        drawTicks: false
    };
    
    const legendStyle = {
        labels: {
            color: '#8e9bb4',
            font: {
                family: 'Plus Jakarta Sans',
                size: 10
            },
            boxWidth: 10,
            usePointStyle: true,
            pointStyle: 'circle'
        }
    };

    // 1. Populasi CO (Donut Chart)
    const ctxCo = document.getElementById('chartPopulasiCo').getContext('2d');
    new Chart(ctxCo, {
        type: 'doughnut',
        data: {
            labels: @json(array_keys($populasiCo)),
            datasets: [{
                data: @json(array_values($populasiCo)),
                backgroundColor: [
                    '#00d2ff', '#0072ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    ...legendStyle
                }
            }
        }
    });

    // 2. Populasi Beban CO (Bar Chart)
    const ctxBeban = document.getElementById('chartBebanCo').getContext('2d');
    new Chart(ctxBeban, {
        type: 'bar',
        data: {
            labels: @json($periods),
            datasets: @json($bebanDatasets)
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    ...legendStyle
                }
            },
            scales: {
                x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } },
                y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } }
            }
        }
    });

    // 3. Populasi Risk (Radar Chart)
    const ctxRadar = document.getElementById('chartPopulasiRiskRadar').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: @json(array_keys($populasiRiskBreakdown)),
            datasets: [{
                label: 'Risk Distribution',
                data: @json(array_values($populasiRiskBreakdown)),
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                borderWidth: 2,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#ef4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    pointLabels: { color: '#8e9bb4', font: { size: 10 } },
                    ticks: { display: false }
                }
            }
        }
    });

    // 4. Trend Prioritas (Line Chart)
    const ctxTrend = document.getElementById('chartTrendPrioritas').getContext('2d');
    new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: @json($periods),
            datasets: @json($trendDatasets)
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', ...legendStyle }
            },
            scales: {
                x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
                y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
            }
        }
    });

    // 5. Pola Bayar Akhir (Line Chart)
    const ctxPola = document.getElementById('chartPolaBayar').getContext('2d');
    new Chart(ctxPola, {
        type: 'line',
        data: {
            labels: @json($periods),
            datasets: @json($polaDatasets)
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', ...legendStyle }
            },
            scales: {
                x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
                y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
            }
        }
    });

    // 6. PS AMBC (Line Chart)
    const ctxPs = document.getElementById('chartPsAmbc').getContext('2d');
    new Chart(ctxPs, {
        type: 'line',
        data: {
            labels: @json($periods),
            datasets: @json($psDatasets)
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', ...legendStyle }
            },
            scales: {
                x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
                y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
            }
        }
    });

    // 7. Populasi Risk - No Order (Bar Chart)
    const ctxNoOrder = document.getElementById('chartRiskNoOrder').getContext('2d');
    new Chart(ctxNoOrder, {
        type: 'bar',
        data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [
                {
                    label: 'Belum Selesai (No Order)',
                    data: [
                        {{ $riskNoOrder['No Order']['Low'] }}, 
                        {{ $riskNoOrder['No Order']['Medium'] }}, 
                        {{ $riskNoOrder['No Order']['High'] }}
                    ],
                    backgroundColor: 'rgba(245, 158, 11, 0.85)',
                    borderRadius: 4
                },
                {
                    label: 'Selesai',
                    data: [
                        {{ $riskNoOrder['Selesai']['Low'] }}, 
                        {{ $riskNoOrder['Selesai']['Medium'] }}, 
                        {{ $riskNoOrder['Selesai']['High'] }}
                    ],
                    backgroundColor: 'rgba(0, 114, 255, 0.85)',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', ...legendStyle }
            },
            scales: {
                x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
                y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
            }
        }
    });
</script>
@endsection
