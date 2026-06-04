@extends('layouts.layout')

@section('title', 'Manajemen Pengguna')
@section('header_title', 'Manajemen Pengguna')
@section('header_subtitle', 'Kelola hak akses pengguna sistem (Administrator, Analis Risiko, dan Manajemen).')

@section('content')
<div class="dashboard-grid">
    {{-- User List Card --}}
    <div class="glass-card col-8">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-users-gear" style="color:#00f0ff;margin-right:8px;"></i>Daftar Pengguna Sistem
            </h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">{{ count($users) }} akun terdaftar</span>
        </div>

        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nama Pengguna</th>
                        <th>Alamat Email</th>
                        <th>Hak Akses / Peran</th>
                        <th>Tanggal Terdaftar</th>
                        <th style="text-align:right;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($users as $i => $u)
                    <tr>
                        <td style="color:var(--text-muted);font-size:0.8rem;">{{ $i + 1 }}</td>
                        <td>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div style="width:32px;height:32px;background:rgba(255,255,255,0.05);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;">
                                    {{ strtoupper(substr($u->name, 0, 1)) }}
                                </div>
                                <span style="font-weight:600;">{{ $u->name }}</span>
                            </div>
                        </td>
                        <td>{{ $u->email }}</td>
                        <td>
                            @if($u->role === 'admin')
                                <span class="badge badge-high" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);">Administrator</span>
                            @elseif($u->role === 'analyst')
                                <span class="badge badge-medium" style="background:rgba(37,99,235,0.15);color:#3b82f6;border:1px solid rgba(37,99,235,0.3);">Analis Risiko</span>
                            @else
                                <span class="badge badge-low" style="background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);">Manajemen</span>
                            @endif
                        </td>
                        <td style="font-size:0.8rem;color:var(--text-muted);">{{ $u->created_at->format('d M Y') }}</td>
                        <td style="text-align:right;">
                            <div style="display:inline-flex;gap:6px;">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="editUser({{ json_encode($u) }})" title="Edit User">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                @if($u->id !== auth()->id())
                                <form action="{{ route('users.destroy', $u->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus user ini?');" style="display:inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-secondary btn-sm" style="color:#ef4444;border-color:rgba(239,68,68,0.2);" title="Hapus User">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- Form Form Card (Add/Edit) --}}
    <div class="glass-card col-4">
        <h3 id="form-title" style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1.5rem;">
            <i class="fa-solid fa-user-plus" style="color:#8b5cf6;margin-right:8px;"></i>Tambah Pengguna Baru
        </h3>

        <form id="user-form" action="{{ route('users.store') }}" method="POST">
            @csrf
            <input type="hidden" name="_method" id="form-method" value="POST">

            <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem;">
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label for="name" style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">Nama Lengkap</label>
                    <input type="text" name="name" id="name" class="form-control" placeholder="Contoh: Julius Wisnu" required>
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label for="email" style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">Alamat Email</label>
                    <input type="email" name="email" id="email" class="form-control" placeholder="nama@perusahaan.com" required>
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label for="role" style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">Hak Akses (Role)</label>
                    <select name="role" id="role" class="form-control form-select" required>
                        <option value="admin">Administrator</option>
                        <option value="analyst">Analis Risiko</option>
                        <option value="management">Manajemen</option>
                    </select>
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label for="password" style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">
                        Kata Sandi <span id="pwd-help" style="font-size:0.7rem;font-weight:normal;color:var(--text-muted);"></span>
                    </label>
                    <input type="password" name="password" id="password" class="form-control" placeholder="Min. 6 karakter" required>
                </div>
            </div>

            <div style="display:flex;gap:10px;">
                <button type="button" id="btn-cancel" class="btn btn-secondary" style="flex:1;display:none;" onclick="resetForm()">
                    Batal
                </button>
                <button type="submit" id="btn-submit" class="btn btn-primary" style="flex:2;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <i class="fa-solid fa-user-plus"></i> Simpan Akun
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@section('scripts')
<script>
function editUser(user) {
    document.getElementById('form-title').innerHTML = '<i class="fa-solid fa-user-pen" style="color:#00f0ff;margin-right:8px;"></i>Edit Pengguna';
    document.getElementById('user-form').action = '/users/' + user.id;
    document.getElementById('form-method').value = 'PUT';
    
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('role').value = user.role;
    
    document.getElementById('password').removeAttribute('required');
    document.getElementById('pwd-help').innerText = '(Kosongkan jika tidak diubah)';
    
    document.getElementById('btn-cancel').style.display = 'block';
    
    const submitBtn = document.getElementById('btn-submit');
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Perbarui Akun';
    submitBtn.className = 'btn btn-primary';
}

function resetForm() {
    document.getElementById('form-title').innerHTML = '<i class="fa-solid fa-user-plus" style="color:#8b5cf6;margin-right:8px;"></i>Tambah Pengguna Baru';
    document.getElementById('user-form').action = '{{ route("users.store") }}';
    document.getElementById('form-method').value = 'POST';
    
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('role').value = 'analyst';
    
    document.getElementById('password').setAttribute('required', 'required');
    document.getElementById('password').value = '';
    document.getElementById('pwd-help').innerText = '';
    
    document.getElementById('btn-cancel').style.display = 'none';
    
    const submitBtn = document.getElementById('btn-submit');
    submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Simpan Akun';
}
</script>
@endsection
