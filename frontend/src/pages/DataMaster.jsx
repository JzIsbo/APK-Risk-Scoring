import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database, 
  Plus, 
  X 
} from 'lucide-react';
import api from '../services/api';

const DataMaster = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add Item Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('co-class'); // co-class, payment-pattern, ps-ambc, status
  const [newValue, setNewValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDataMaster = async () => {
    try {
      const res = await api.get('/data-master');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data master.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataMaster();
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setNewValue('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const endpoint = `/data-master/${modalType}`;
      const res = await api.post(endpoint, { name: newValue });
      setSuccess(res.data.message);
      setIsModalOpen(false);
      fetchDataMaster();
    } catch (err) {
      console.error(err);
      setError('Gagal menambahkan data master.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data master...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ margin: '2rem 0' }}>
        <AlertTriangle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const {
    coClasses,
    paymentPatterns,
    psAmbcClasses,
    statuses,
    coStats,
    patternStats,
    psStats,
    statusStats,
    periodStats
  } = data;

  const modalTitles = {
    'co-class': 'Tambah Kelas CO Baru',
    'payment-pattern': 'Tambah Pola Bayar Baru',
    'ps-ambc': 'Tambah PS AMBC Baru',
    'status': 'Tambah Status Baru'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: split tables */}
      <div className="dashboard-grid">
        
        {/* Table 1: Kelas CO */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} className="text-cyan-500" />
              Tabel Kelas CO (Credit Officer)
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('co-class')}>
              <Plus size={12} />
              Tambah
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Kelas</th>
                  <th>Total Debitur</th>
                  <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                  <th>Avg. Skor</th>
                </tr>
              </thead>
              <tbody>
                {coClasses.map(c => (
                  <tr key={c}>
                    <td style={{ fontWeight: 700 }}>{c}</td>
                    <td>{coStats[c]?.total || 0}</td>
                    <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{coStats[c]?.high || 0}</td>
                    <td style={{ fontWeight: 700 }}>{coStats[c]?.avg_score || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Pola Bayar */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} className="text-blue-500" />
              Tabel Kategori Pola Bayar
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('payment-pattern')}>
              <Plus size={12} />
              Tambah
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pola</th>
                  <th>Total Debitur</th>
                  <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                  <th>Avg. Delay</th>
                </tr>
              </thead>
              <tbody>
                {paymentPatterns.map(p => (
                  <tr key={p}>
                    <td style={{ fontWeight: 700 }}>{p}</td>
                    <td>{patternStats[p]?.total || 0}</td>
                    <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{patternStats[p]?.high || 0}</td>
                    <td>{patternStats[p]?.avg_delay || 0} hari</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: PS AMBC */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} className="text-purple-500" />
              Tabel Kategori PS AMBC
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('ps-ambc')}>
              <Plus size={12} />
              Tambah
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kelas PS</th>
                  <th>Total Debitur</th>
                  <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                  <th>Avg. Skor</th>
                </tr>
              </thead>
              <tbody>
                {psAmbcClasses.map(ps => (
                  <tr key={ps}>
                    <td style={{ fontWeight: 700 }}>{ps}</td>
                    <td>{psStats[ps]?.total || 0}</td>
                    <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{psStats[ps]?.high || 0}</td>
                    <td style={{ fontWeight: 700 }}>{psStats[ps]?.avg_score || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4: Statuses */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} className="text-pink-500" />
              Tabel Status Portofolio
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('status')}>
              <Plus size={12} />
              Tambah
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Total Debitur</th>
                  <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                  <th>Avg. Skor</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map(s => (
                  <tr key={s}>
                    <td style={{ fontWeight: 700 }}>{s}</td>
                    <td>{statusStats[s]?.total || 0}</td>
                    <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{statusStats[s]?.high || 0}</td>
                    <td style={{ fontWeight: 700 }}>{statusStats[s]?.avg_score || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 5: Periods */}
        <div className="col-12 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} className="text-emerald-500" />
            Tabel Periode Laporan
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Periode</th>
                  <th>Volume Debitur</th>
                  <th style={{ color: 'var(--color-high)' }}>Volume High Risk</th>
                  <th>Rata-rata Skor Risiko</th>
                </tr>
              </thead>
              <tbody>
                {periodStats.map(p => (
                  <tr key={p.period}>
                    <td style={{ fontWeight: 700 }}>{p.period}</td>
                    <td>{p.total}</td>
                    <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{p.high_count}</td>
                    <td style={{ fontWeight: 700 }}>{(parseFloat(p.avg_score) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{modalTitles[modalType]}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="newValue">Nama / Label Data</label>
                <input
                  type="text"
                  id="newValue"
                  className="form-control"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Contoh: PR-4 atau L6"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DataMaster;
