import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Laporan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Filters
  const [period, setPeriod] = useState('');
  const [coClass, setCoClass] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [page, setPage] = useState(1);

  const loadLaporan = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (period) params.period = period;
      if (coClass) params.co_class = coClass;
      if (riskLevel) params.risk_level = riskLevel;

      const response = await api.get('/laporan', { params });
      setData(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaporan();
  }, [page, period, coClass, riskLevel]);

  // Secure Excel blob download passing Bearer token
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {};
      if (period) params.period = period;
      if (coClass) params.co_class = coClass;
      if (riskLevel) params.risk_level = riskLevel;

      const response = await api.get('/laporan/export', {
        params,
        responseType: 'blob' // Essential to read binary files
      });

      // Trigger browser file download
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `laporan-risiko-debitur-${new Date().toISOString().substring(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export excel', err);
      alert('Gagal mengekspor laporan Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = () => {
    // Open a new tab to our print-friendly layout path
    const params = [];
    if (period) params.push(`period=${period}`);
    if (coClass) params.push(`co_class=${coClass}`);
    if (riskLevel) params.push(`risk_level=${riskLevel}`);
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    window.open(`/laporan-print${queryString}`, '_blank');
  };

  if (loading && !data) return <div className="loading-container">Memuat laporan...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { populations, summaryStats, availablePeriods, byCoClass, byPattern, byPsAmbc } = data;

  return (
    <>
      {/* Filters & Actions bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
          <select value={period} onChange={e => { setPeriod(e.target.value); setPage(1); }} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', outline: 'none' }}>
            <option value="" style={{ background: '#050b1a' }}>Semua Periode</option>
            {availablePeriods.map(p => (
              <option key={p} value={p} style={{ background: '#050b1a' }}>{p}</option>
            ))}
          </select>

          <select value={coClass} onChange={e => { setCoClass(e.target.value); setPage(1); }} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', outline: 'none' }}>
            <option value="" style={{ background: '#050b1a' }}>Semua CO</option>
            <option value="PR-1" style={{ background: '#050b1a' }}>PR-1</option>
            <option value="PR-2" style={{ background: '#050b1a' }}>PR-2</option>
            <option value="PR-3" style={{ background: '#050b1a' }}>PR-3</option>
          </select>

          <select value={riskLevel} onChange={e => { setRiskLevel(e.target.value); setPage(1); }} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', outline: 'none' }}>
            <option value="" style={{ background: '#050b1a' }}>Semua Risiko</option>
            <option value="Low" style={{ background: '#050b1a' }}>Low Risk</option>
            <option value="Medium" style={{ background: '#050b1a' }}>Medium Risk</option>
            <option value="High" style={{ background: '#050b1a' }}>High Risk</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportExcel} disabled={exporting} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {exporting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-excel" style={{ color: '#10b981' }}></i>}
            <span>Ekspor Excel</span>
          </button>
          <button onClick={handlePrintPdf} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', color: '#050b1a', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-print"></i>
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-cyan)' }}><i className="fa-solid fa-users"></i></div>
          <div>
            <span className="metric-label">Filtered Debitur</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.filtered} / {summaryStats.total}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Debitur Sesuai Filter</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-high)' }}><i className="fa-solid fa-radiation"></i></div>
          <div>
            <span className="metric-label">High Risk Total</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.high}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Seluruh Sistem</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--color-blue)' }}><i className="fa-solid fa-chart-line"></i></div>
          <div>
            <span className="metric-label">Rata-rata DTI</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.avg_dti.toFixed(2)}%</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Seluruh Portofolio</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-clock"></i></div>
          <div>
            <span className="metric-label">Rata-rata Delay</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.avg_delay.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hari</span></span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kolektibilitas</span>
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', marginBottom: '1.5rem' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Debitur Detail</h4>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 16px' }}>No.</th>
                <th style={{ padding: '10px 16px' }}>Nama Debitur</th>
                <th style={{ padding: '10px 16px' }}>Periode</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Usia</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>DTI</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Keterlambatan</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Skor Kredit</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Beban CO</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Skor Risiko</th>
                <th style={{ padding: '10px 16px', textAlign: 'center' }}>Tingkat Risiko</th>
              </tr>
            </thead>
            <tbody>
              {populations.data.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ditemukan data debitur.</td>
                </tr>
              ) : (
                populations.data.map((item, idx) => {
                  const riskColors = item.risk_level === 'High'
                    ? { bg: 'rgba(239, 68, 68, 0.1)', fg: '#fca5a5' }
                    : item.risk_level === 'Medium'
                      ? { bg: 'rgba(245, 158, 11, 0.1)', fg: '#fde047' }
                      : { bg: 'rgba(16, 185, 129, 0.1)', fg: '#a7f3d0' };
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{(page - 1) * 20 + idx + 1}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '10px 16px' }}>{item.period}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{item.age}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{item.dti}%</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{item.payment_delay} Hari</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{item.credit_score}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{item.co_burden}%</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{item.risk_score.toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, background: riskColors.bg, color: riskColors.fg }}>
                          {item.risk_level}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {populations.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Menampilkan data {(page - 1) * 20 + 1} - {Math.min(page * 20, populations.total)} dari {populations.total} debitur</span>
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

      {/* Row 4: Secondary breakdowns */}
      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* Pola Bayar breakdown */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statistik Berdasarkan Pola Bayar</h4>
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 20px' }}>Pola Bayar</th>
                <th style={{ padding: '10px 20px', textAlign: 'center' }}>Total Debitur</th>
                <th style={{ padding: '10px 20px', textAlign: 'right' }}>Rata-rata Skor</th>
              </tr>
            </thead>
            <tbody>
              {byPattern.map(pat => (
                <tr key={pat.payment_pattern} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 20px', fontWeight: 600 }}>{pat.payment_pattern}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center' }}>{pat.cnt}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{parseFloat(pat.avg_score).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PS AMBC breakdown */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statistik Berdasarkan PS AMBC</h4>
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 20px' }}>PS AMBC</th>
                <th style={{ padding: '10px 20px', textAlign: 'center' }}>Total Debitur</th>
                <th style={{ padding: '10px 20px', textAlign: 'right' }}>Rata-rata Skor</th>
              </tr>
            </thead>
            <tbody>
              {byPsAmbc.map(ps => (
                <tr key={ps.ps_ambc} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 20px', fontWeight: 600 }}>{ps.ps_ambc}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center' }}>{ps.cnt}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{parseFloat(ps.avg_score).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
