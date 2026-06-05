import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openForm = (user = null) => {
    setEditingUser(user);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword(''); // Password empty when editing (unless changing it)
      setRole(user.role);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('analyst');
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const payload = {
      name,
      email,
      role,
    };
    if (password) payload.password = password;

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        setSuccess('Informasi pengguna berhasil diperbarui!');
      } else {
        if (!password) {
          setError('Password wajib diisi untuk pengguna baru.');
          return;
        }
        await api.post('/users', payload);
        setSuccess('Pengguna baru berhasil dibuat!');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan pengguna.');
      }
    }
  };

  const handleDelete = async (userToDelete) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userToDelete.name}"?`)) return;
    setSuccess('');
    setError('');

    try {
      const response = await api.delete(`/users/${userToDelete.id}`);
      setSuccess(response.data.message);
      loadUsers();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menghapus pengguna.');
      }
    }
  };

  if (loading && users.length === 0) return <div className="loading-container">Memuat pengguna...</div>;
  if (error && users.length === 0) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daftar staf yang memiliki hak akses masuk ke sistem</span>
        <button onClick={() => openForm()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', color: '#050b1a', fontWeight: 700, cursor: 'pointer' }}>
          <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Tambah Pengguna
        </button>
      </div>

      {success && (
        <div className="alert alert-success" style={{ padding: '12px', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <i className="fa-solid fa-circle-check"></i> {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ padding: '12px', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <i className="fa-solid fa-circle-xmark"></i> {error}
        </div>
      )}

      {/* Users table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <th style={{ padding: '12px 20px' }}>Nama</th>
                <th style={{ padding: '12px 20px' }}>Email</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Hak Akses (Role)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Terdaftar Pada</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleBadge = u.role === 'admin'
                  ? { bg: 'rgba(0, 210, 255, 0.1)', fg: '#67e8f9', label: 'Administrator' }
                  : u.role === 'analyst'
                    ? { bg: 'rgba(139, 92, 246, 0.1)', fg: '#c084fc', label: 'Risk Analyst' }
                    : { bg: 'rgba(255, 255, 255, 0.05)', fg: '#cbd5e1', label: 'Management' };
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }} className="table-row">
                    <td style={{ padding: '12px 20px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 20px' }}>{u.email}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: roleBadge.bg, color: roleBadge.fg }}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => openForm(u)} style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', fontSize: '1rem' }} title="Edit">
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button onClick={() => handleDelete(u)} style={{ background: 'none', border: 'none', color: 'var(--color-high)', cursor: 'pointer', fontSize: '1rem' }} title="Hapus">
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 11, 26, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Nama Lengkap</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} placeholder="Contoh: Budi Santoso" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} placeholder="budi@perusahaan.com" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Kata Sandi (Password)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Hak Akses (Role)</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                  <option value="admin" style={{ background: '#050b1a' }}>Administrator</option>
                  <option value="analyst" style={{ background: '#050b1a' }}>Risk Analyst (Analis)</option>
                  <option value="management" style={{ background: '#050b1a' }}>Management (Direksi/Pimpinan)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', border: 'none', borderRadius: '10px', color: '#050b1a', fontWeight: 700, cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
