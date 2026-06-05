import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  FileSpreadsheet, 
  Printer, 
  Filter, 
  TrendingUp, 
  Clock, 
  Percent 
} from 'lucide-react';
import api from '../services/api';

const Laporan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState('');
  const [coClass, setCoClass] = useState('');
  const [riskLevel, setRiskLevel] = useState('');

  const [excelDownloading, setExcelDownloading] = useState(false);

  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/laporan?page=${page}&period=${period}&co_class=${coClass}&risk_level=${riskLevel}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanData();
  }, [page, period, coClass, riskLevel]);

  const handleExportExcel = async () => {
    setExcelDownloading(true);
    try {
      const res = await api.get(`/laporan/export?period=${period}&co_class=${coClass}&risk_level=${riskLevel}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-risiko-debitur-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel download failed', err);
      alert('Gagal mendownload laporan Excel.');
    } finally {
      setExcelDownloading(false);
    }
  };

  const handlePrintPdf = () => {
    // Open the printable React route in a new tab
    const url = `/laporan/print?period=${period}&co_class=${coClass}&risk_level=${riskLevel}`;
    window.open(url, '_blank');
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data laporan...</span>
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
    populations,
    summaryStats,
    availablePeriods,
    byCoClass,
    byPattern,
    byPsAmbc
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Filters & Export Toolbar */}
      <section className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          
          {/* Filters input */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginRight: '6px' }}>
              <Filter size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Laporan:</span>
            </div>

            <select
              className="form-control form-select"
              style={{ width: '140px' }}
              value={period}
              onChange={(e) => { setPeriod(e.target.value); setPage(1); }}
            >
              <option value="">Semua Periode</option>
              {availablePeriods.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
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
          </div>

          {/* Export action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleExportExcel} disabled={excelDownloading}>
              <FileSpreadsheet size={16} />
              {excelDownloading ? 'Mengunduh...' : 'Ekspor Excel'}
            </button>
            <button className="btn btn-primary" onClick={handlePrintPdf}>
              <Printer size={16} />
              Cetak PDF
            </button>
          </div>

        </div>
      </section>

      {/* Stats Summary Panel */}
      <section className="metrics-grid">
        {/* Total Debitur */}
        <div className="glass-card metric-card">
          <div>
            <span className="metric-label">Filtered Debitur</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.filtered}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total Database: {summaryStats.total}
          </span>
        </div>

        {/* Avg Risk Score */}
        <div className="glass-card metric-card">
          <div>
            <span className="metric-label">Avg. Skor Risiko</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.avg_score}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Skala skoring 0 - 100
          </span>
        </div>

        {/* Avg DTI */}
        <div className="glass-card metric-card">
          <div>
            <span className="metric-label">Avg. DTI %</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.avg_dti}%</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Debt to Income Ratio
          </span>
        </div>

        {/* Avg Delay */}
        <div className="glass-card metric-card">
          <div>
            <span className="metric-label">Avg. Keterlambatan</span>
            <div className="metric-value-container">
              <span className="metric-value">{summaryStats.avg_delay}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Dalam satuan hari delay
          </span>
        </div>
      </section>

      {/* Main Grid: left column list, right column distribution tables */}
      <div className="dashboard-grid">
        
        {/* Left: filtered list */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '0 0 1.5rem 0', overflow: 'hidden' }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No.</th>
                    <th>Nama Debitur</th>
                    <th>Kelas CO</th>
                    <th>Skor Risiko</th>
                    <th>Tingkat Risiko</th>
                    <th>Status</th>
                    <th>Periode</th>
                  </tr>
                </thead>
                <tbody>
                  {populations.data.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Tidak ada data debitur ditemukan dengan filter ini.
                      </td>
                    </tr>
                  ) : (
                    populations.data.map((pop, idx) => (
                      <tr key={pop.id}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          {(populations.current_page - 1) * populations.per_page + idx + 1}
                        </td>
                        <td style={{ fontWeight: 600 }}>{pop.name}</td>
                        <td>{pop.co_class}</td>
                        <td style={{ fontWeight: 700 }}>{pop.risk_score.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${pop.risk_level.toLowerCase()}`}>
                            {pop.risk_level}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-status">{pop.status}</span>
                        </td>
                        <td>{pop.period}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {populations.last_page > 1 && (
              <div className="pagination-container" style={{ padding: '0 1.5rem' }}>
                <span className="pagination-info">
                  Menampilkan <strong>{populations.data.length}</strong> dari <strong>{populations.total}</strong> debitur
                </span>
                <div className="pagination-links">
                  <button 
                    className="btn btn-secondary btn-sm" 
                    disabled={page === 1} 
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: populations.last_page }, (_, i) => i + 1).map(p => (
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
                    disabled={page === populations.last_page} 
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: distributions stats */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Risk distribution by CO */}
          <div className="glass-card" style={{ padding: '0 0 1rem 0', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, padding: '1.25rem', fontFamily: 'var(--font-display)' }}>
              Distribusi Risiko per Kelas CO
            </h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Kelas</th>
                    <th style={{ color: 'var(--color-high)' }}>H</th>
                    <th style={{ color: 'var(--color-medium)' }}>M</th>
                    <th style={{ color: 'var(--color-low)' }}>L</th>
                  </tr>
                </thead>
                <tbody>
                  {['PR-1', 'PR-2', 'PR-3'].map(c => (
                    <tr key={c}>
                      <td style={{ fontWeight: 700 }}>{c}</td>
                      <td>{byCoClass[c]?.High || 0}</td>
                      <td>{byCoClass[c]?.Medium || 0}</td>
                      <td>{byCoClass[c]?.Low || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk stats by Pattern */}
          <div className="glass-card" style={{ padding: '0 0 1rem 0', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, padding: '1.25rem', fontFamily: 'var(--font-display)' }}>
              Skor Risiko per Pola Bayar
            </h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Pola</th>
                    <th>Volume</th>
                    <th>Avg. Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {byPattern.map(pat => (
                    <tr key={pat.payment_pattern}>
                      <td style={{ fontWeight: 700 }}>{pat.payment_pattern}</td>
                      <td>{pat.cnt}</td>
                      <td style={{ fontWeight: 700 }}>{(parseFloat(pat.avg_score) || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk stats by PS AMBC */}
          <div className="glass-card" style={{ padding: '0 0 1rem 0', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, padding: '1.25rem', fontFamily: 'var(--font-display)' }}>
              Skor Risiko per PS AMBC
            </h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>PS</th>
                    <th>Volume</th>
                    <th>Avg. Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {byPsAmbc.map(ps => (
                    <tr key={ps.ps_ambc}>
                      <td style={{ fontWeight: 700 }}>{ps.ps_ambc}</td>
                      <td>{ps.cnt}</td>
                      <td style={{ fontWeight: 700 }}>{(parseFloat(ps.avg_score) || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Laporan;
