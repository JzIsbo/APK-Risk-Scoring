import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

export default function Populasi() {
  const { user } = useOutletContext();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [coClass, setCoClass] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(35);
  const [formDti, setFormDti] = useState(30);
  const [formDelay, setFormDelay] = useState(10);
  const [formCredit, setFormCredit] = useState(700);
  const [formBurden, setFormBurden] = useState(25);
  const [formStatus, setFormStatus] = useState('No Order');
  const [formCoClass, setFormCoClass] = useState('PR-1');
  const [formPattern, setFormPattern] = useState('L3');
  const [formPsAmbc, setFormPsAmbc] = useState('PS-1');
  const [formPeriod, setFormPeriod] = useState(new Date().toISOString().substring(0, 7)); // e.g. 2026-06

  // Form Live Preview States
  const [previewScore, setPreviewScore] = useState(0);
  const [previewLevel, setPreviewLevel] = useState('Low');

  // Excel file upload
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Load items
  const loadPopulations = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search) params.search = search;
      if (riskLevel) params.risk_level = riskLevel;
      if (coClass) params.co_class = coClass;

      const response = await api.get('/populasi', { params });
      setItems(response.data.data);
      setMeta({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data populasi debitur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopulations();
  }, [page, riskLevel, coClass]);

  // Fetch preview risk score when weights change in form
  useEffect(() => {
    if (!showFormModal) return;

    const fetchPreview = async () => {
      try {
        const response = await api.post('/populasi/preview', {
          dti: parseFloat(formDti) || 0,
          payment_delay: parseInt(formDelay) || 0,
          credit_score: parseInt(formCredit) || 0,
          age: parseInt(formAge) || 0,
          co_burden: parseFloat(formBurden) || 0,
        });
        setPreviewScore(response.data.risk_score);
        setPreviewLevel(response.data.risk_level);
      } catch (err) {
        console.error('Failed to fetch risk preview', err);
      }
    };

    const debounce = setTimeout(fetchPreview, 300);
    return () => clearTimeout(debounce);
  }, [formDti, formDelay, formCredit, formAge, formBurden, showFormModal]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadPopulations();
  };

  // Open Form modal
  const openForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormName(item.name);
      setFormAge(item.age);
      setFormDti(item.dti);
      setFormDelay(item.payment_delay);
      setFormCredit(item.credit_score);
      setFormBurden(item.co_burden);
      setFormStatus(item.status);
      setFormCoClass(item.co_class);
      setFormPattern(item.payment_pattern);
      setFormPsAmbc(item.ps_ambc);
      setFormPeriod(item.period);
      setPreviewScore(item.risk_score);
      setPreviewLevel(item.risk_level);
    } else {
      setFormName('');
      setFormAge(35);
      setFormDti(30);
      setFormDelay(10);
      setFormCredit(700);
      setFormBurden(25);
      setFormStatus('No Order');
      setFormCoClass('PR-1');
      setFormPattern('L3');
      setFormPsAmbc('PS-1');
      setFormPeriod(new Date().toISOString().substring(0, 7));
      setPreviewScore(0);
      setPreviewLevel('Low');
    }
    setShowFormModal(true);
  };

  // Save Debtor Form
  const handleSaveDebtor = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const payload = {
      name: formName,
      age: parseInt(formAge),
      dti: parseFloat(formDti),
      payment_delay: parseInt(formDelay),
      credit_score: parseInt(formCredit),
      co_burden: parseFloat(formBurden),
      status: formStatus,
      co_class: formCoClass,
      payment_pattern: formPattern,
      ps_ambc: formPsAmbc,
      period: formPeriod,
    };

    try {
      if (editingItem) {
        await api.put(`/populasi/${editingItem.id}`, payload);
        setSuccess('Data debitur berhasil diperbarui!');
      } else {
        await api.post('/populasi', payload);
        setSuccess('Data debitur berhasil ditambahkan dan tingkat risiko dihitung secara real-time!');
      }
      setShowFormModal(false);
      loadPopulations();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan data debitur.');
      }
    }
  };

  // Delete Debtor
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data debitur ini?')) return;
    setSuccess('');
    setError('');

    try {
      await api.delete(`/populasi/${id}`);
      setSuccess('Data debitur berhasil dihapus!');
      loadPopulations();
    } catch (err) {
      console.error(err);
      setError('Gagal menghapus data debitur.');
    }
  };

  // Recalculate all risk levels
  const handleRecalculate = async () => {
    setSuccess('');
    setError('');
    try {
      const response = await api.post('/populasi/recalculate');
      setSuccess(response.data.message);
      loadPopulations();
    } catch (err) {
      console.error(err);
      setError('Gagal kalkulasi ulang risiko.');
    }
  };

  // Excel Import
  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!excelFile) return;

    setSuccess('');
    setError('');
    setImporting(true);

    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const response = await api.post('/populasi/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(response.data.message);
      setShowImportModal(false);
      setExcelFile(null);
      loadPopulations();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mengimpor file excel.');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      {/* Action triggers row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Search and Filter Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <i className="fa-solid fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari debitur..."
              style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          
          <select value={riskLevel} onChange={e => { setRiskLevel(e.target.value); setPage(1); }} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', outline: 'none' }}>
            <option value="" style={{ background: '#050b1a' }}>Semua Risiko</option>
            <option value="Low" style={{ background: '#050b1a' }}>Low Risk</option>
            <option value="Medium" style={{ background: '#050b1a' }}>Medium Risk</option>
            <option value="High" style={{ background: '#050b1a' }}>High Risk</option>
          </select>

          <select value={coClass} onChange={e => { setCoClass(e.target.value); setPage(1); }} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', outline: 'none' }}>
            <option value="" style={{ background: '#050b1a' }}>Semua CO</option>
            <option value="PR-1" style={{ background: '#050b1a' }}>PR-1</option>
            <option value="PR-2" style={{ background: '#050b1a' }}>PR-2</option>
            <option value="PR-3" style={{ background: '#050b1a' }}>PR-3</option>
          </select>
          
          <button type="submit" className="btn btn-secondary" style={{ display: 'none' }}>Cari</button>
        </form>

        {/* Buttons for Admin / Analyst */}
        {(user.role === 'admin' || user.role === 'analyst') && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => openForm()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', color: '#050b1a', fontWeight: 700, cursor: 'pointer' }}>
              <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Tambah Debitur
            </button>
            <button onClick={handleRecalculate} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', color: 'white', cursor: 'pointer' }}>
              <i className="fa-solid fa-rotate" style={{ marginRight: '6px' }}></i> Kalkulasi Ulang
            </button>
            <button onClick={() => setShowImportModal(true)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', color: 'white', cursor: 'pointer' }}>
              <i className="fa-solid fa-file-import" style={{ marginRight: '6px' }}></i> Impor Excel
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="alert alert-success" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-low)' }}></i>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-xmark" style={{ color: 'var(--color-high)' }}></i>
          <span>{error}</span>
        </div>
      )}

      {/* Debtors Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>No.</th>
                <th style={{ padding: '12px 16px' }}>Nama Debitur</th>
                <th style={{ padding: '12px 16px' }}>Periode</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Usia</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>DTI</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Keterlambatan</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Skor Kredit</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Beban CO</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Skor Risiko</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Tingkat Risiko</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                {(user.role === 'admin' || user.role === 'analyst') && (
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data debitur...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ditemukan data debitur yang sesuai.</td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const riskColors = item.risk_level === 'High'
                    ? { bg: 'rgba(239, 68, 68, 0.1)', fg: '#fca5a5' }
                    : item.risk_level === 'Medium'
                      ? { bg: 'rgba(245, 158, 11, 0.1)', fg: '#fde047' }
                      : { bg: 'rgba(16, 185, 129, 0.1)', fg: '#a7f3d0' };

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', transition: 'background-color 0.2s' }} className="table-row">
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{(page - 1) * 10 + idx + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '12px 16px' }}>{item.period}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.age} Thn</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.dti}%</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.payment_delay} Hari</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.credit_score}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.co_burden}%</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-blue)' }}>{item.risk_score.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: riskColors.bg, color: riskColors.fg }}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.status}</span>
                      </td>
                      {(user.role === 'admin' || user.role === 'analyst') && (
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => openForm(item)} style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', fontSize: '1rem' }} title="Ubah">
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                            {user.role === 'admin' && (
                              <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-high)', cursor: 'pointer', fontSize: '1rem' }} title="Hapus">
                                <i className="fa-regular fa-trash-can"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {meta.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Menampilkan data {(page - 1) * 10 + 1} - {Math.min(page * 10, meta.total)} dari {meta.total} debitur</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: page === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', color: page === 1 ? 'var(--text-muted)' : 'white', cursor: page === 1 ? 'default' : 'pointer' }}>
                Sebelumnya
              </button>
              <button disabled={page === meta.last_page} onClick={() => setPage(page + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: page === meta.last_page ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', color: page === meta.last_page ? 'var(--text-muted)' : 'white', cursor: page === meta.last_page ? 'default' : 'pointer' }}>
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showFormModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 11, 26, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingItem ? 'Edit Data Debitur' : 'Tambah Debitur Baru'}</h3>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveDebtor} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Nama Debitur</label>
                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} placeholder="Masukkan nama lengkap" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Usia (Tahun)</label>
                <input required type="number" min={1} max={120} value={formAge} onChange={e => setFormAge(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Rasio Utang (DTI %)</label>
                <input required type="number" step="0.01" min={0} max={100} value={formDti} onChange={e => setFormDti(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Keterlambatan (Hari)</label>
                <input required type="number" min={0} value={formDelay} onChange={e => setFormDelay(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Skor Kredit</label>
                <input required type="number" min={300} max={850} value={formCredit} onChange={e => setFormCredit(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Rasio Beban CO (%)</label>
                <input required type="number" step="0.01" min={0} max={100} value={formBurden} onChange={e => setFormBurden(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Periode (YYYY-MM)</label>
                <input required type="text" pattern="^\d{4}-\d{2}$" value={formPeriod} onChange={e => setFormPeriod(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }} placeholder="Contoh: 2026-06" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Status</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                  <option value="No Order" style={{ background: '#050b1a' }}>No Order</option>
                  <option value="Active" style={{ background: '#050b1a' }}>Active</option>
                  <option value="Settled" style={{ background: '#050b1a' }}>Settled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Kelas CO</label>
                <select value={formCoClass} onChange={e => setFormCoClass(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                  <option value="PR-1" style={{ background: '#050b1a' }}>PR-1</option>
                  <option value="PR-2" style={{ background: '#050b1a' }}>PR-2</option>
                  <option value="PR-3" style={{ background: '#050b1a' }}>PR-3</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Pola Bayar</label>
                <select value={formPattern} onChange={e => setFormPattern(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                  <option value="L3" style={{ background: '#050b1a' }}>L3</option>
                  <option value="L4" style={{ background: '#050b1a' }}>L4</option>
                  <option value="L5" style={{ background: '#050b1a' }}>L5</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>PS AMBC</label>
                <select value={formPsAmbc} onChange={e => setFormPsAmbc(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                  <option value="PS-1" style={{ background: '#050b1a' }}>PS-1</option>
                  <option value="PS-2" style={{ background: '#050b1a' }}>PS-2</option>
                  <option value="PS-3" style={{ background: '#050b1a' }}>PS-3</option>
                  <option value="PS-4" style={{ background: '#050b1a' }}>PS-4</option>
                </select>
              </div>

              {/* Dynamic preview block */}
              <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Preview Kalkulasi Risiko</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Dihitung real-time saat Anda mengetik</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-blue)', display: 'block' }}>{previewScore.toFixed(2)}</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, background: previewLevel === 'High' ? 'rgba(239, 68, 68, 0.15)' : previewLevel === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: previewLevel === 'High' ? '#fca5a5' : previewLevel === 'Medium' ? '#fde047' : '#a7f3d0' }}>
                    {previewLevel} Risk
                  </span>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', border: 'none', borderRadius: '10px', color: '#050b1a', fontWeight: 700, cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 11, 26, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}><i className="fa-solid fa-file-excel" style={{ color: '#10b981', marginRight: '8px' }}></i> Impor Data dari Excel / CSV</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleImportExcel}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pilih File Excel (.xlsx / .xls / .csv)</label>
                <input
                  required
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={e => setExcelFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
                <strong>Petunjuk Format Kolom:</strong>
                <ul style={{ marginLeft: '16px', marginTop: '6px', listStyleType: 'disc' }}>
                  <li>Nama Debitur (header: 'nama', 'name', dll)</li>
                  <li>Usia (header: 'usia', 'umur', 'age')</li>
                  <li>DTI (header: 'dti', 'rasio utang')</li>
                  <li>Keterlambatan (header: 'keterlambatan', 'delay')</li>
                  <li>Skor Kredit (header: 'skor kredit', 'credit score')</li>
                  <li>Beban CO (header: 'beban co', 'co burden')</li>
                  <li>Periode (header: 'periode', 'bulan', 'period' format YYYY-MM)</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowImportModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={importing} className="btn btn-primary" style={{ padding: '8px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {importing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Mengimpor...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-upload"></i>
                      <span>Mulai Impor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
