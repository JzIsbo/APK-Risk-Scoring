import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { 
  Search, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Percent, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import api from '../services/api';

const RiskAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [coClass, setCoClass] = useState('');

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/risk-analysis?page=${page}&search=${search}&risk_level=${riskLevel}&co_class=${coClass}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data analisis risiko.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, [page, search, riskLevel, coClass]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data analisis...</span>
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
    stats,
    riskByCo,
    topRisk,
    parameters
  } = data;

  // Render Grouped Bar Chart for Risk per CO Class
  const coLabels = Object.keys(riskByCo);
  const coHigh = coLabels.map(c => riskByCo[c]?.High || 0);
  const coMedium = coLabels.map(c => riskByCo[c]?.Medium || 0);
  const coLow = coLabels.map(c => riskByCo[c]?.Low || 0);

  const gridStyle = { color: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.05)' };
  const legendStyle = {
    labels: {
      color: '#8e9bb4',
      font: { family: 'Plus Jakarta Sans', size: 10 },
      boxWidth: 8,
      usePointStyle: true,
      pointStyle: 'circle'
    }
  };

  const chartData = {
    labels: coLabels,
    datasets: [
      { label: 'High', data: coHigh, backgroundColor: '#ef4444', borderRadius: 2 },
      { label: 'Medium', data: coMedium, backgroundColor: '#f59e0b', borderRadius: 2 },
      { label: 'Low', data: coLow, backgroundColor: '#10b981', borderRadius: 2 }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', ...legendStyle }
    },
    scales: {
      x: { grid: gridStyle, ticks: { color: '#8e9bb4' } },
      y: { grid: gridStyle, ticks: { color: '#8e9bb4' }, beginAtZero: true }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Toolbar */}
      <section className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} className="text-secondary" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Cari debitur atau kelas CO..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="form-control form-select"
            style={{ width: '150px' }}
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
            style={{ width: '150px' }}
            value={coClass}
            onChange={(e) => { setCoClass(e.target.value); setPage(1); }}
          >
            <option value="">Semua CO</option>
            <option value="PR-1">PR-1</option>
            <option value="PR-2">PR-2</option>
            <option value="PR-3">PR-3</option>
          </select>
        </div>
      </section>

      {/* Main Grid: left column list, right column stats & charts */}
      <div className="dashboard-grid">
        
        {/* Left col: Debtors list */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '0 0 1.5rem 0', overflow: 'hidden' }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>No.</th>
                    <th>Nama Debitur</th>
                    <th>Kelas CO</th>
                    <th>DTI %</th>
                    <th>Delay</th>
                    <th>Skor Risiko</th>
                    <th>Tingkat Risiko</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {populations.data.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Tidak ada data analisis ditemukan.
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
                        <td>{pop.dti}%</td>
                        <td>{pop.payment_delay} hari</td>
                        <td style={{ fontWeight: 700 }}>{pop.risk_score.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${pop.risk_level.toLowerCase()}`}>
                            {pop.risk_level}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Link 
                            to={`/risk-analysis/${pop.id}`} 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px' }}
                            title="Buka Profil"
                          >
                            <ArrowRight size={12} />
                          </Link>
                        </td>
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

        {/* Right col: Stats & Chart widget */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary stats */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
              Metrik Distribusi Portofolio
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Portofolio</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.total} Debitur</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kritis (High Risk)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-high)' }}>{stats.high} ({((stats.high/stats.total)*100 || 0).toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sedang (Medium Risk)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-medium)' }}>{stats.medium} ({((stats.medium/stats.total)*100 || 0).toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rendah (Low Risk)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-low)' }}>{stats.low} ({((stats.low/stats.total)*100 || 0).toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} className="text-cyan-500" /> Rata-rata Skor Risiko
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.avg_score}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Percent size={14} className="text-blue-500" /> Rata-rata DTI
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.avg_dti}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} className="text-purple-500" /> Rata-rata Keterlambatan
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.avg_delay} hari</span>
              </div>
            </div>
          </div>

          {/* Grouped bar chart */}
          <div className="glass-card" style={{ height: '260px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', fontFamily: 'var(--font-display)' }}>
              Tingkat Risiko per Kelas CO
            </h3>
            <div style={{ flex: 1, position: 'relative' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Top 5 risks debtors list */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
              Top 5 Debitur Risiko Tertinggi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topRisk.slice(0, 5).map(pop => (
                <Link 
                  key={pop.id} 
                  to={`/risk-analysis/${pop.id}`}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="top-risk-link"
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{pop.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CO {pop.co_class}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-high)' }}>{pop.risk_score.toFixed(1)}</span>
                    <span className="badge badge-high" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>High</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default RiskAnalysis;
