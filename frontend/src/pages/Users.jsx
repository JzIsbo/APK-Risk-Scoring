import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null); // null means creating

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'analyst'
  });
  const [submitting, setSubmitting] = useState(false);

  const loggedInUserString = localStorage.getItem('user');
  const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : { id: 0 };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleOpenCreateModal = () => {
    setCurrentEditUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'analyst'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setCurrentEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave password blank on edit
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (currentEditUser) {
        // Edit mode
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't submit blank password

        await api.put(`/users/${currentEditUser.id}`, payload);
        setSuccess('Informasi user berhasil diperbarui!');
      } else {
        // Create mode
        if (!formData.password || formData.password.length < 6) {
          setError('Password minimal harus 6 karakter.');
          setSubmitting(false);
          return;
        }
        await api.post('/users', formData);
        setSuccess('User baru berhasil dibuat!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === loggedInUser.id) {
      setError('Anda tidak dapat menghapus akun Anda sendiri!');
      return;
    }

    if (!window.confirm(`Hapus akun user '${userToDelete.name}'?`)) return;

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setSuccess('User berhasil dihapus!');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('Gagal menghapus user.');
    }
  };

  return (
    <div>
      {/* Alerts feed */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <section className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <UsersIcon size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Daftar Pengguna Sistem</span>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} />
            Tambah User
          </button>
        </div>
      </section>

      {/* Users Grid Table */}
      <section className="glass-card" style={{ padding: '0 0 1.5rem 0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>No.</th>
                <th>Nama Lengkap</th>
                <th>Alamat Email</th>
                <th>Hak Akses (Role)</th>
                <th>Tanggal Terdaftar</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw className="animate-spin text-cyan-500" size={24} style={{ display: 'inline-block' }} />
                    <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Memuat data user...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      {u.name} {u.id === loggedInUser.id && <small style={{ color: 'var(--color-cyan)', fontStyle: 'italic' }}>(Anda)</small>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-high' : u.role === 'analyst' ? 'badge-low' : 'badge-status'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleOpenEditModal(u)} 
                          style={{ padding: '6px' }}
                          title="Ubah"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteUser(u)} 
                          disabled={u.id === loggedInUser.id}
                          style={{ padding: '6px', opacity: u.id === loggedInUser.id ? 0.3 : 1 }}
                          title="Hapus"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{currentEditUser ? 'Ubah Akun User' : 'Tambah User Baru'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nama Lengkap User"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Alamat Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@perusahaan.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  {currentEditUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi'}
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={currentEditUser ? '•••••••• (Biarkan kosong)' : 'Minimal 6 karakter'}
                  required={!currentEditUser}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="role">Hak Akses Sistem</label>
                <select id="role" className="form-control form-select" value={formData.role} onChange={handleInputChange}>
                  <option value="admin">Admin (Akses Penuh)</option>
                  <option value="analyst">Analyst (Ubah Data Debitur)</option>
                  <option value="management">Management (Lihat Laporan & Grafik)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
