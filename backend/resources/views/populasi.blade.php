@extends('layouts.layout')

@section('title', 'Manajemen Populasi')
@section('header_title', 'Manajemen Populasi Debitur')
@section('header_subtitle', 'Kelola data populasi debitur dan analisis tingkat risiko mereka secara real-time.')

@section('content')
<div class="glass-card" style="margin-bottom: 2rem; padding: 1.25rem 1.5rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <!-- Filters -->
        <form action="{{ route('populasi.index') }}" method="GET" style="display: flex; gap: 12px; flex: 1; flex-wrap: wrap;">
            <input type="text" name="search" class="form-control" placeholder="Cari nama, CO kelas, tingkat risiko..." value="{{ request('search') }}" style="max-width: 280px;">
            
            <select name="risk_level" class="form-control form-select" style="max-width: 150px;">
                <option value="">Semua Risiko</option>
                <option value="Low" {{ request('risk_level') == 'Low' ? 'selected' : '' }}>Low Risk</option>
                <option value="Medium" {{ request('risk_level') == 'Medium' ? 'selected' : '' }}>Medium Risk</option>
                <option value="High" {{ request('risk_level') == 'High' ? 'selected' : '' }}>High Risk</option>
            </select>

            <select name="co_class" class="form-control form-select" style="max-width: 150px;">
                <option value="">Semua Kelas CO</option>
                <option value="PR-1" {{ request('co_class') == 'PR-1' ? 'selected' : '' }}>PR-1</option>
                <option value="PR-2" {{ request('co_class') == 'PR-2' ? 'selected' : '' }}>PR-2</option>
                <option value="PR-3" {{ request('co_class') == 'PR-3' ? 'selected' : '' }}>PR-3</option>
            </select>

            <button type="submit" class="btn btn-secondary">
                <i class="fa-solid fa-filter"></i> Filter
            </button>
            @if(request()->anyFilled(['search', 'risk_level', 'co_class']))
                <a href="{{ route('populasi.index') }}" class="btn btn-secondary" style="display: flex; align-items: center; justify-content: center;">Reset</a>
            @endif
        </form>

        <!-- Actions -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <form action="{{ route('populasi.recalculate') }}" method="POST" style="display: inline;">
                @csrf
                <button type="submit" class="btn btn-secondary" title="Kalkulasi ulang semua data berdasarkan parameter saat ini">
                    <i class="fa-solid fa-arrows-rotate"></i> Kalkulasi Ulang
                </button>
            </form>
            <button onclick="openImportModal()" class="btn btn-secondary" style="border-color: rgba(16,185,129,0.4); color: #6ee7b7; background: rgba(16,185,129,0.1);">
                <i class="fa-solid fa-file-import"></i> Import Excel
            </button>
            <button onclick="openAddModal()" class="btn btn-primary">
                <i class="fa-solid fa-user-plus"></i> Tambah Debitur
            </button>
        </div>
    </div>
</div>

<!-- Debtor Table -->
<div class="glass-card">
    <div class="table-container">
        <table class="custom-table">
            <thead>
                <tr>
                    <th>Nama</th>
                    <th>Usia</th>
                    <th>Rasio Utang (DTI)</th>
                    <th>Keterlambatan (Hari)</th>
                    <th>Skor Kredit</th>
                    <th>Beban CO (%)</th>
                    <th>Skor Risiko</th>
                    <th>Tingkat Risiko</th>
                    <th>Status / Kelas</th>
                    <th>Periode</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($populations as $pop)
                    <tr>
                        <td style="font-weight: 600;">{{ $pop->name }}</td>
                        <td>{{ $pop->age }} th</td>
                        <td>{{ $pop->dti }}%</td>
                        <td>{{ $pop->payment_delay }} hari</td>
                        <td>{{ $pop->credit_score }}</td>
                        <td>{{ $pop->co_burden }}%</td>
                        <td style="font-weight: 700; font-family: var(--font-display); font-size: 1rem; color: #ffffff;">
                            {{ $pop->risk_score }}
                        </td>
                        <td>
                            @if($pop->risk_level === 'High')
                                <span class="badge badge-high">High</span>
                            @elseif($pop->risk_level === 'Medium')
                                <span class="badge badge-medium">Medium</span>
                            @else
                                <span class="badge badge-low">Low</span>
                            @endif
                        </td>
                        <td>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span class="badge badge-status" style="width: fit-content; font-size: 0.65rem;">{{ $pop->status }}</span>
                                <span style="font-size: 0.75rem; color: var(--text-secondary);">{{ $pop->co_class }} / {{ $pop->payment_pattern }}</span>
                            </div>
                        </td>
                        <td>{{ $pop->period }}</td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="openEditModal({{ json_encode($pop) }})" class="btn btn-secondary btn-sm" title="Edit Debitur">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <form action="{{ route('populasi.destroy', $pop->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus debitur ini?')" style="display: inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm" title="Hapus Debitur">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="11" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                            Tidak ada data debitur ditemukan.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination Links -->
    @if($populations->hasPages())
        <div class="pagination-container">
            <div class="pagination-info">
                Menampilkan {{ $populations->firstItem() }} - {{ $populations->lastItem() }} dari {{ $populations->total() }} debitur
            </div>
            <div class="pagination-links">
                {{-- Previous Page Link --}}
                @if ($populations->onFirstPage())
                    <span>&laquo;</span>
                @else
                    <a href="{{ $populations->previousPageUrl() }}">&laquo;</a>
                @endif

                {{-- Page Links --}}
                @foreach ($populations->getUrlRange(1, $populations->lastPage()) as $page => $url)
                    @if ($page == $populations->currentPage())
                        <span class="active">{{ $page }}</span>
                    @else
                        <a href="{{ $url }}">{{ $page }}</a>
                    @endif
                @endforeach

                {{-- Next Page Link --}}
                @if ($populations->hasMorePages())
                    <a href="{{ $populations->nextPageUrl() }}">&raquo;</a>
                @else
                    <span>&raquo;</span>
                @endif
            </div>
        </div>
    @endif
</div>

<!-- Modal Form (Tambah / Edit Debitur) -->
<div id="debtorModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle" class="modal-title">Tambah Debitur Baru</h3>
            <button onclick="closeModal()" class="modal-close">&times;</button>
        </div>
        
        <form id="debtorForm" action="{{ route('populasi.store') }}" method="POST">
            @csrf
            <input type="hidden" name="_method" id="formMethod" value="POST">
            
            <div class="dashboard-grid" style="gap: 12px;">
                <!-- Nama Debitur -->
                <div class="form-group col-12" style="margin-bottom: 6px;">
                    <label class="form-label" for="name">Nama Debitur</label>
                    <input type="text" name="name" id="name" class="form-control" placeholder="Nama lengkap debitur" required>
                </div>

                <!-- Usia & Periode -->
                <div class="form-group col-6">
                    <label class="form-label" for="age">Usia (Tahun)</label>
                    <input type="number" name="age" id="age" class="form-control preview-trigger" min="18" max="100" placeholder="25" required>
                </div>
                <div class="form-group col-6">
                    <label class="form-label" for="period">Periode (YYYY-MM)</label>
                    <input type="text" name="period" id="period" class="form-control" placeholder="2026-04" value="2026-04" required>
                </div>

                <!-- DTI & Beban CO -->
                <div class="form-group col-6">
                    <label class="form-label" for="dti">Rasio Utang (DTI %)</label>
                    <input type="number" step="0.01" name="dti" id="dti" class="form-control preview-trigger" min="0" max="100" placeholder="30.00" required>
                </div>
                <div class="form-group col-6">
                    <label class="form-label" for="co_burden">Rasio Beban CO (%)</label>
                    <input type="number" step="0.01" name="co_burden" id="co_burden" class="form-control preview-trigger" min="0" max="100" placeholder="15.00" required>
                </div>

                <!-- Keterlambatan & Skor Kredit -->
                <div class="form-group col-6">
                    <label class="form-label" for="payment_delay">Keterlambatan (Hari)</label>
                    <input type="number" name="payment_delay" id="payment_delay" class="form-control preview-trigger" min="0" placeholder="0" required>
                </div>
                <div class="form-group col-6">
                    <label class="form-label" for="credit_score">Skor Kredit</label>
                    <input type="number" name="credit_score" id="credit_score" class="form-control preview-trigger" min="300" max="850" placeholder="700" required>
                </div>

                <!-- Tambahan status-status layout -->
                <div class="form-group col-4">
                    <label class="form-label" for="status">Status</label>
                    <select name="status" id="status" class="form-control form-select">
                        <option value="No Order">No Order</option>
                        <option value="Active">Active</option>
                        <option value="Settled">Settled</option>
                    </select>
                </div>
                <div class="form-group col-4">
                    <label class="form-label" for="co_class">Kelas CO</label>
                    <select name="co_class" id="co_class" class="form-control form-select">
                        <option value="PR-1">PR-1</option>
                        <option value="PR-2">PR-2</option>
                        <option value="PR-3">PR-3</option>
                    </select>
                </div>
                <div class="form-group col-4">
                    <label class="form-label" for="payment_pattern">Pola Bayar</label>
                    <select name="payment_pattern" id="payment_pattern" class="form-control form-select">
                        <option value="L3">L3</option>
                        <option value="L4">L4</option>
                        <option value="L5">L5</option>
                    </select>
                </div>
                <div class="form-group col-12" style="margin-bottom: 0;">
                    <label class="form-label" for="ps_ambc">PS AMBC</label>
                    <select name="ps_ambc" id="ps_ambc" class="form-control form-select">
                        <option value="PS-1">PS-1</option>
                        <option value="PS-2">PS-2</option>
                        <option value="PS-3">PS-3</option>
                        <option value="PS-4">PS-4</option>
                    </select>
                </div>
            </div>

            <!-- Real-Time Preview Panel -->
            <div class="preview-panel">
                <span class="preview-title">Real-Time Risk Calculation Preview</span>
                <div class="preview-row">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Kalkulasi Skor Risiko</div>
                        <span id="previewScore" class="preview-score">0.00</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px;">Kategori Risiko</div>
                        <span id="previewBadge" class="badge badge-low">Low</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
                <button type="button" onclick="closeModal()" class="btn btn-secondary">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    </div>
</div>
<!-- Import Excel Modal -->
<div id="importModal" class="modal-overlay">
    <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
            <h3 class="modal-title">Import Data Debitur (Excel)</h3>
            <button onclick="closeImportModal()" class="modal-close">&times;</button>
        </div>

        <form action="{{ route('populasi.import') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label class="form-label">File Excel (.xlsx / .xls)</label>
                <input type="file" name="file" accept=".xlsx,.xls" class="form-control" required>
            </div>
            <div style="background: rgba(0,240,255,0.05); border: 1px solid var(--border-color-glow); border-radius: 10px; padding: 12px; margin-bottom: 1rem; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6;">
                <strong style="color: var(--color-cyan); display: block; margin-bottom: 4px;"><i class="fa-solid fa-circle-info"></i> Format Kolom Excel</strong>
                name | age | dti | payment_delay | credit_score | co_burden | status | co_class | payment_pattern | ps_ambc | period
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeImportModal()" class="btn btn-secondary">Batal</button>
                <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <i class="fa-solid fa-file-import"></i> Import Sekarang
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@section('scripts')
<script>
    const modal = document.getElementById('debtorModal');
    const importModal = document.getElementById('importModal');
    const form = document.getElementById('debtorForm');
    const modalTitle = document.getElementById('modalTitle');
    const formMethod = document.getElementById('formMethod');
    const previewScore = document.getElementById('previewScore');
    const previewBadge = document.getElementById('previewBadge');

    function openImportModal() {
        importModal.classList.add('active');
    }
    function closeImportModal() {
        importModal.classList.remove('active');
    }
    // Close import modal on backdrop click
    importModal.addEventListener('click', (e) => {
        if (e.target === importModal) closeImportModal();
    });

    function openAddModal() {
        modalTitle.innerText = "Tambah Debitur Baru";
        form.action = "{{ route('populasi.store') }}";
        formMethod.value = "POST";
        form.reset();
        
        // Reset preview
        updatePreviewValues(0, 'Low');
        
        modal.classList.add('active');
    }

    function openEditModal(pop) {
        modalTitle.innerText = "Edit Data Debitur";
        form.action = `/populasi/${pop.id}`;
        formMethod.value = "PUT";

        // Fill form fields
        document.getElementById('name').value = pop.name;
        document.getElementById('age').value = pop.age;
        document.getElementById('period').value = pop.period;
        document.getElementById('dti').value = pop.dti;
        document.getElementById('co_burden').value = pop.co_burden;
        document.getElementById('payment_delay').value = pop.payment_delay;
        document.getElementById('credit_score').value = pop.credit_score;
        document.getElementById('status').value = pop.status;
        document.getElementById('co_class').value = pop.co_class;
        document.getElementById('payment_pattern').value = pop.payment_pattern;
        document.getElementById('ps_ambc').value = pop.ps_ambc;

        // Set initial preview based on saved values
        updatePreviewValues(pop.risk_score, pop.risk_level);

        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    function updatePreviewValues(score, level) {
        previewScore.innerText = parseFloat(score).toFixed(2);
        
        // Update badge styles
        previewBadge.className = 'badge';
        if (level === 'High') {
            previewBadge.classList.add('badge-high');
            previewBadge.innerText = 'High';
        } else if (level === 'Medium') {
            previewBadge.classList.add('badge-medium');
            previewBadge.innerText = 'Medium';
        } else {
            previewBadge.classList.add('badge-low');
            previewBadge.innerText = 'Low';
        }
    }

    // Real-Time Calculation Preview Hook
    const previewTriggers = document.querySelectorAll('.preview-trigger');
    previewTriggers.forEach(input => {
        input.addEventListener('input', triggerRealtimeCalc);
    });

    let debounceTimer;
    function triggerRealtimeCalc() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const age = document.getElementById('age').value;
            const dti = document.getElementById('dti').value;
            const co_burden = document.getElementById('co_burden').value;
            const payment_delay = document.getElementById('payment_delay').value;
            const credit_score = document.getElementById('credit_score').value;

            // Only call preview API if inputs are valid numbers
            if (dti !== '' && payment_delay !== '' && credit_score !== '' && age !== '' && co_burden !== '') {
                fetch('{{ route('populasi.preview') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({
                        age: age,
                        dti: dti,
                        co_burden: co_burden,
                        payment_delay: payment_delay,
                        credit_score: credit_score
                    })
                })
                .then(response => response.json())
                .then(data => {
                    updatePreviewValues(data.risk_score, data.risk_level);
                })
                .catch(err => console.error("Gagal memicu preview real-time:", err));
            }
        }, 150); // Small debounce
    }
</script>
@endsection
