import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function RiskAnalysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states (initialized from query string if present)
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('risk_level') || '');
  const [coClass, setCoClass] = useState('');
  const [page, setPage] = useState(1);

  const loadRiskAnalysis = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search) params.search = search;
      if (riskLevel) params.risk_level = riskLevel;
      if (coClass) params.co_class = coClass;

      const response = await api.get('/risk-analysis', { params });
      setData(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data analisis risiko.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskAnalysis();
  }, [page, riskLevel, coClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadRiskAnalysis();
  };

  if (loading && !data) return <div className="loading-container">Memuat data analisis...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { populations, stats } = data;

  return (
    <>
      {/* Grid of stats */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-high)' }}><i className="fa-solid fa-radiation"></i></div>
          <div>
            <span className="metric-label">High Risk</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.high}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jumlah Debitur Kritis</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-medium)' }}><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div>
            <span className="metric-label">Medium Risk</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.medium}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jumlah Debitur Waspada</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-low)' }}><i className="fa-solid fa-shield-halved"></i></div>
          <div>
            <span className="metric-label">Low Risk</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.low}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jumlah Debitur Aman</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-blue)' }}><i className="fa-solid fa-chart-bar"></i></div>
          <div>
            <span className="metric-label">Rata-rata Skor</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.avg_score.toFixed(2)}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skor Portofolio</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-clock"></i></div>
          <div>
            <span className="metric-label">Rerata Keterlambatan</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.avg_delay.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hari</span></span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kolektibilitas Debitur</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <i className="fa-solid fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau kelas..."
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
        </form>
        
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Diurutkan berdasarkan skor tertinggi (Prioritas Penanganan)
        </span>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>No.</th>
                <th style={{ padding: '12px 16px' }}>Nama Debitur</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Periode</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>DTI</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Keterlambatan</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Skor Kredit</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Beban CO</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Skor Risiko</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Tingkat Risiko</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Kelas CO</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {populations.data.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ditemukan data debitur.</td>
                </tr>
              ) : (
                populations.data.map((item, idx) => {
                  const riskColors = item.risk_level === 'High'
                    ? { bg: 'rgba(239, 68, 68, 0.1)', fg: '#fca5a5' }
                    : item.risk_level === 'Medium'
                      ? { bg: 'rgba(245, 158, 11, 0.1)', fg: '#fde047' }
                      : { bg: 'rgba(16, 185, 129, 0.1)', fg: '#a7f3d0' };

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }} className="table-row">
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{(page - 1) * 15 + idx + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.period}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.dti}%</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.payment_delay} Hari</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.credit_score}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.co_burden}%</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{item.risk_score.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: riskColors.bg, color: riskColors.fg }}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.co_class}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button onClick={() => navigate(`/risk-analysis/${item.id}`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                          <i className="fa-solid fa-chart-pie" style={{ marginRight: '4px' }}></i> Profil Risiko
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {populations.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Menampilkan data {(page - 1) * 15 + 1} - {Math.min(page * 15, populations.total)} dari {populations.total} debitur</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: page === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', color: page === 1 ? 'var(--text-muted)' : 'white', cursor: page === 1 ? 'default' : 'pointer' }}>
                Sebelumnya
              </button>
              <button disabled={page === populations.last_page} onClick={() => setPage(page + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: page === populations.last_page ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', color: page === populations.last_page ? 'var(--text-muted)' : 'white', cursor: page === populations.last_page ? 'default' : 'pointer' }}>
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
