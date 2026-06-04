@extends('layouts.layout')

@section('title', 'Parameter Risiko')
@section('header_title', 'Konfigurasi Parameter Risiko')
@section('header_subtitle', 'Sesuaikan bobot dan kriteria pembobotan untuk menghitung skor risiko debitur.')

@section('content')
<div class="glass-card" style="margin-bottom: 2rem;">
    <div class="weight-summary">
        <div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #ffffff;">Total Akumulasi Bobot</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Semua bobot parameter harus diakumulasikan tepat sebesar 100%.</p>
        </div>
        <div style="text-align: right;">
            <div id="weightTotalDisplay" style="font-family: var(--font-display); font-size: 2.25rem; font-weight: 800; color: var(--color-cyan);">
                {{ $totalWeight }}%
            </div>
            <span id="weightStatusBadge" class="badge badge-low" style="margin-top: 4px;">Valid</span>
        </div>
    </div>

    <form id="parameterForm" action="{{ route('parameter.update') }}" method="POST">
        @csrf
        
        @foreach($parameters as $param)
            <div class="parameter-section">
                <div class="parameter-header">
                    <div>
                        <span class="parameter-title">{{ $param->name }}</span>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Database Key: <code>{{ $param->key }}</code></div>
                    </div>
                    
                    <div class="parameter-weight-box">
                        <label class="form-label" style="margin-bottom: 0; margin-right: 8px;">Bobot:</label>
                        <div style="position: relative; max-width: 110px;">
                            <input type="number" step="0.01" name="weights[{{ $param->key }}]" class="form-control weight-input" value="{{ $param->weight }}" style="padding-right: 30px; text-align: right;" required>
                            <span style="position: absolute; right: 12px; top: 10px; color: var(--text-muted);">%</span>
                        </div>
                    </div>
                </div>

                <!-- Criteria Rules Preview -->
                <div style="margin-top: 10px;">
                    <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Kriteria Penilaian:</div>
                    <div class="criteria-grid">
                        @foreach($param->criteria as $ruleIndex => $rule)
                            <div class="criteria-item">
                                <div>Rentang Nilai:</div>
                                <div style="font-weight: 600; color: #ffffff; margin-top: 2px;">
                                    @if(isset($rule['min']) && $rule['min'] == 0 && isset($rule['max']) && $rule['max'] > 5000)
                                        Seluruh Nilai
                                    @elseif(isset($rule['min']) && $rule['min'] <= -9999)
                                        &le; {{ $rule['max'] }}
                                    @elseif(isset($rule['max']) && $rule['max'] >= 9999)
                                        &ge; {{ $rule['min'] }}
                                    @else
                                        {{ $rule['min'] }} - {{ $rule['max'] }}
                                    @endif
                                </div>
                                <div class="criteria-badge-row">
                                    <span style="font-size: 0.75rem;">Skor: <strong>{{ $rule['score'] }}</strong></span>
                                    @if($rule['level'] === 'High')
                                        <span class="badge badge-high" style="font-size: 0.6rem; padding: 2px 6px;">High</span>
                                    @elseif($rule['level'] === 'Medium')
                                        <span class="badge badge-medium" style="font-size: 0.6rem; padding: 2px 6px;">Med</span>
                                    @else
                                        <span class="badge badge-low" style="font-size: 0.6rem; padding: 2px 6px;">Low</span>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        @endforeach

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
            <button type="reset" class="btn btn-secondary">Reset Bobot</button>
            <button type="submit" id="btnSubmitWeights" class="btn btn-primary">
                <i class="fa-solid fa-cloud-arrow-up"></i> Simpan Parameter & Kalkulasi Ulang
            </button>
        </div>
    </form>
</div>
@endsection

@section('scripts')
<script>
    const weightInputs = document.querySelectorAll('.weight-input');
    const display = document.getElementById('weightTotalDisplay');
    const badge = document.getElementById('weightStatusBadge');
    const btnSubmit = document.getElementById('btnSubmitWeights');

    function calculateTotalWeight() {
        let total = 0;
        weightInputs.forEach(input => {
            total += parseFloat(input.value || 0);
        });
        
        display.innerText = total.toFixed(2) + '%';

        // Check if exactly 100
        if (Math.abs(total - 100) < 0.01) {
            badge.innerText = 'Valid';
            badge.className = 'badge badge-low';
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = '1';
            btnSubmit.style.cursor = 'pointer';
        } else {
            badge.innerText = 'Tidak Valid (Harus 100%)';
            badge.className = 'badge badge-high';
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = '0.5';
            btnSubmit.style.cursor = 'not-allowed';
        }
    }

    weightInputs.forEach(input => {
        input.addEventListener('input', calculateTotalWeight);
    });

    // Run initial calculation
    calculateTotalWeight();
</script>
@endsection
