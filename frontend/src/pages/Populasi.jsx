import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import api from '../services/api';

const Populasi = () => {
  const [populations, setPopulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [coClass, setCoClass] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentDebtor, setCurrentDebtor] = useState(null); // null means creating, object means editing

  // Form inputs state
  const [formData, setFormData] = useState({
    name: '',
    dti: 0,
    payment_delay: 0,
    credit_score: 600,
    age: 30,
    co_burden: 0,
    status: 'No Order',
    co_class: 'PR-1',
    payment_pattern: 'L3',
    ps_ambc: 'PS-1',
    period: new Date().toISOString().slice(0, 7) // YYYY-MM
  });

  // Real-time preview risk state
  const [preview, setPreview] = useState({ risk_score: 0, risk_level: 'Low' });
  const [previewLoading, setPreviewLoading] = useState(false);

  // Excel file upload state
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'analyst' };

  const fetchPopulations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/populasi?page=${page}&search=${search}&risk_level=${riskLevel}&co_class=${coClass}`);
      setPopulations(res.data.data);
      setTotalPages(res.data.last_page);
      setTotalItems(res.data.total);
      setPerPage(res.data.per_page);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data populasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopulations();
  }, [page, search, riskLevel, coClass]);

  // Handle preview calculation when inputs change
  useEffect(() => {
    if (!isFormModalOpen) return;

    const delayDebounce = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await api.post('/populasi/preview', {
          dti: formData.dti,
          payment_delay: formData.payment_delay,
          credit_score: formData.credit_score,
          age: formData.age,
          co_burden: formData.co_burden
        });
        setPreview(res.data);
      } catch (err) {
        console.error('Preview error', err);
      } finally {
        setPreviewLoading(false);
      }
    }, 400); // Debounce API requests

    return () => clearTimeout(delayDebounce);
  }, [formData.dti, formData.payment_delay, formData.credit_score, formData.age, formData.co_burden, isFormModalOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: ['dti', 'payment_delay', 'credit_score', 'age', 'co_burden'].includes(id) ? parseFloat(value) || 0 : value
    }));
  };

  const handleOpenCreateModal = () => {
    setCurrentDebtor(null);
    setFormData({
      name: '',
      dti: 25,
      payment_delay: 0,
      credit_score: 650,
      age: 35,
      co_burden: 15,
      status: 'Active',
      co_class: 'PR-1',
      payment_pattern: 'L3',
      ps_ambc: 'PS-1',
      period: new Date().toISOString().slice(0, 7)
    });
    setPreview({ risk_score: 0, risk_level: 'Low' });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (debtor) => {
    setCurrentDebtor(debtor);
    setFormData({
      name: debtor.name,
      dti: debtor.dti,
      payment_delay: debtor.payment_delay,
      credit_score: debtor.credit_score,
      age: debtor.age,
      co_burden: debtor.co_burden,
      status: debtor.status,
      co_class: debtor.co_class,
      payment_pattern: debtor.payment_pattern,
      ps_ambc: debtor.ps_ambc,
      period: debtor.period
    });
    setPreview({ risk_score: debtor.risk_score, risk_level: debtor.risk_level });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (currentDebtor) {
        // Edit mode
        await api.put(`/populasi/${currentDebtor.id}`, formData);
        setSuccess('Data debitur berhasil diperbarui!');
      } else {
        // Create mode
        await api.post('/populasi', formData);
        setSuccess('Data debitur berhasil ditambahkan!');
      }
      setIsFormModalOpen(false);
      fetchPopulations();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan data.');
      }
    }
  };

  const handleDeleteDebtor = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus debitur ini?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/populasi/${id}`);
      setSuccess('Data debitur berhasil dihapus!');
      fetchPopulations();
    } catch (err) {
      console.error(err);
      setError('Gagal menghapus data debitur.');
    }
  };

  const handleRecalculate = async () => {
    if (!window.confirm('Kalkulasi ulang semua data debitur berdasarkan bobot & kriteria parameter terbaru?')) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.post('/populasi/recalculate');
      setSuccess('Seluruh data debitur berhasil dikalkulasi ulang!');
      fetchPopulations();
    } catch (err) {
      console.error(err);
      setError('Gagal melakukan kalkulasi ulang.');
      setLoading(false);
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!excelFile) return;

    setError(null);
    setSuccess(null);
    setImporting(true);

    const data = new FormData();
    data.append('file', excelFile);

    try {
      const res = await api.post('/populasi/import', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(res.data.message);
      setIsImportModalOpen(false);
      setExcelFile(null);
      fetchPopulations();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mengimpor file Excel.');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* Alert logs */}
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

      {/* Table Header toolbar */}
      <section className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          
          {/* Left search filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1, maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} className="text-secondary" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="Cari nama, kelas CO, atau tingkat risiko..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select
              className="form-control form-select"
              style={{ width: '130px' }}
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            >
              <option value="">Semua Risiko</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            <select
              className="form-control form-select"
              style={{ width: '130px' }}
              value={coClass}
              onChange={(e) => { setCoClass(e.target.value); setPage(1); }}
            >
              <option value="">Semua CO</option>
              <option value="PR-1">PR-1</option>
              <option value="PR-2">PR-2</option>
              <option value="PR-3">PR-3</option>
            </select>
          </div>

          {/* Right actions toolbar */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {user.role === 'admin' && (
              <button className="btn btn-secondary" onClick={handleRecalculate} title="Kalkulasi Ulang Semua">
                <RefreshCw size={16} />
                Kalkulasi Ulang
              </button>
            )}

            <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={16} />
              Impor Excel
            </button>

            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={16} />
              Tambah Debitur
            </button>
          </div>

        </div>
      </section>

      {/* Main Debtor Table */}
      <section className="glass-card" style={{ padding: '0 0 1.5rem 0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>No.</th>
                <th>Nama Debitur</th>
                <th>Usia</th>
                <th>DTI (%)</th>
                <th>Delay (Hari)</th>
                <th>Skor Kredit</th>
                <th>Beban CO (%)</th>
                <th>Skor Risiko</th>
                <th>Tingkat Risiko</th>
                <th>Status</th>
                <th>Periode</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw className="animate-spin text-cyan-500" size={24} style={{ display: 'inline-block' }} />
                    <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Memuat data debitur...</span>
                  </td>
                </tr>
              ) : populations.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Tidak ada data debitur ditemukan.
                  </td>
                </tr>
              ) : (
                populations.map((pop, idx) => (
                  <tr key={pop.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{(page - 1) * perPage + idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{pop.name}</td>
                    <td>{pop.age} th</td>
                    <td>{pop.dti}%</td>
                    <td>{pop.payment_delay} hari</td>
                    <td>{pop.credit_score}</td>
                    <td>{pop.co_burden}%</td>
                    <td style={{ fontWeight: 700 }}>{pop.risk_score.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${pop.risk_level.toLowerCase()}`}>
                        {pop.risk_level}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-status">{pop.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pop.period}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleOpenEditModal(pop)} 
                          style={{ padding: '6px' }}
                          title="Ubah"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteDebtor(pop.id)} 
                          style={{ padding: '6px' }}
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

        {/* Pagination Toolbar */}
        {!loading && totalPages > 1 && (
          <div className="pagination-container" style={{ padding: '0 1.5rem' }}>
            <span className="pagination-info">
              Menampilkan <strong>{populations.length}</strong> dari <strong>{totalItems}</strong> debitur
            </span>
            <div className="pagination-links">
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={page === 1} 
                onClick={() => setPage(prev => prev - 1)}
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px' }}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={page === totalPages} 
                onClick={() => setPage(prev => prev + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ marginTop: '20px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{currentDebtor ? 'Ubah Debitur' : 'Tambah Debitur'}</h3>
              <button className="modal-close" onClick={() => setIsFormModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="name">Nama Lengkap Debitur</label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="age">Usia Debitur (Tahun)</label>
                  <input
                    type="number"
                    id="age"
                    className="form-control"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="period">Periode Laporan</label>
                  <input
                    type="text"
                    id="period"
                    className="form-control"
                    value={formData.period}
                    onChange={handleInputChange}
                    placeholder="YYYY-MM (e.g. 2026-04)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dti">Debt to Income (DTI %)</label>
                  <input
                    type="number"
                    id="dti"
                    className="form-control"
                    value={formData.dti}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="payment_delay">Keterlambatan (Hari)</label>
                  <input
                    type="number"
                    id="payment_delay"
                    className="form-control"
                    value={formData.payment_delay}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="credit_score">Skor Kredit</label>
                  <input
                    type="number"
                    id="credit_score"
                    className="form-control"
                    value={formData.credit_score}
                    onChange={handleInputChange}
                    min="300"
                    max="850"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co_burden">Rasio Beban CO (%)</label>
                  <input
                    type="number"
                    id="co_burden"
                    className="form-control"
                    value={formData.co_burden}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status Debitur</label>
                  <select id="status" className="form-control form-select" value={formData.status} onChange={handleInputChange}>
                    <option value="No Order">No Order</option>
                    <option value="Active">Active</option>
                    <option value="Settled">Settled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co_class">Kelas CO</label>
                  <select id="co_class" className="form-control form-select" value={formData.co_class} onChange={handleInputChange}>
                    <option value="PR-1">PR-1</option>
                    <option value="PR-2">PR-2</option>
                    <option value="PR-3">PR-3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="payment_pattern">Pola Bayar</label>
                  <select id="payment_pattern" className="form-control form-select" value={formData.payment_pattern} onChange={handleInputChange}>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ps_ambc">Kelas PS AMBC</label>
                  <select id="ps_ambc" className="form-control form-select" value={formData.ps_ambc} onChange={handleInputChange}>
                    <option value="PS-1">PS-1</option>
                    <option value="PS-2">PS-2</option>
                    <option value="PS-3">PS-3</option>
                    <option value="PS-4">PS-4</option>
                  </select>
                </div>
              </div>

              {/* Dynamic preview block */}
              <div className="preview-panel">
                <span className="preview-title">Real-Time Kalkulasi Preview</span>
                <div className="preview-row">
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kalkulasi Skor Risiko:</span>
                    <div className="preview-score">
                      {previewLoading ? '...' : preview.risk_score.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kategori Tingkat Risiko:</span>
                    <div style={{ marginTop: '4px' }}>
                      {previewLoading ? (
                        <span style={{ color: 'var(--text-muted)' }}>...</span>
                      ) : (
                        <span className={`badge badge-${preview.risk_level.toLowerCase()}`}>{preview.risk_level}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Impor Data Debitur</h3>
              <button className="modal-close" onClick={() => setIsImportModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImportExcel}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2.5rem 1rem', background: 'rgba(0,0,0,0.1)' }}>
                <FileSpreadsheet size={48} className="text-secondary" style={{ marginBottom: '1rem' }} />
                
                <input
                  type="file"
                  id="excel_file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                
                <label 
                  htmlFor="excel_file" 
                  className="btn btn-secondary" 
                  style={{ cursor: 'pointer', marginBottom: '8px' }}
                >
                  Pilih File Excel
                </label>
                
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {excelFile ? excelFile.name : 'Dukung format .xlsx, .xls, atau .csv'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setIsImportModalOpen(false); setExcelFile(null); }}
                  disabled={importing}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!excelFile || importing}
                >
                  {importing ? 'Mengimpor...' : 'Impor Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Populasi;
