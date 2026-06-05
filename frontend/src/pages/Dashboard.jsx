import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Ban, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Settings as SettingsIcon,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Matrix settings state
  const [matrixX, setMatrixX] = useState('payment_delay');
  const [matrixY, setMatrixY] = useState('dti');
  const [saveDefault, setSaveDefault] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'analyst' };

  const fetchDashboardData = async (paramX = null, paramY = null) => {
    try {
      const x = paramX || matrixX;
      const y = paramY || matrixY;
      const res = await api.get(`/dashboard?matrix_x_param=${x}&matrix_y_param=${y}`);
      setData(res.data);
      setMatrixX(res.data.matrixX);
      setMatrixY(res.data.matrixY);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApplyMatrix = async (e) => {
    e.preventDefault();
    setRefreshing(true);
    if (saveDefault && user.role === 'admin') {
      try {
        await api.post('/dashboard/matrix-settings', {
          matrix_x_param: matrixX,
          matrix_y_param: matrixY,
          save_as_default: true
        });
      } catch (err) {
        console.error('Failed to save default settings', err);
      }
    }
    fetchDashboardData(matrixX, matrixY);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data analitik...</span>
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
    totalPopulation,
    riskPopulation,
    highRisk,
    lowRisk,
    noOrder,
    populasiCo,
    bebanDatasets,
    populasiRiskBreakdown,
    trendDatasets,
    polaDatasets,
    psDatasets,
    riskNoOrder,
    periods,
    changes,
    matrixData
  } = data;

  // Global Chart config variables
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

  // 1. Populasi CO (Doughnut Chart)
  const coLabels = Object.keys(populasiCo);
  const coValues = Object.values(populasiCo);
  const doughnutData = {
    labels: coLabels,
    datasets: [{
      data: coValues,
      backgroundColor: ['#00d2ff', '#0072ff', '#8b5cf6', '#ec4899', '#10b981'],
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)'
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        ...legendStyle
      }
    }
  };

  // 2. Populasi Beban CO (Bar Chart)
  const barBebanData = {
    labels: periods,
    datasets: bebanDatasets.map(d => ({
      ...d,
      backgroundColor: d.backgroundColor || '#00d2ff',
    }))
  };

  const barBebanOptions = {
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

  // 3. Populasi Risk (Radar Chart)
  const radarLabels = Object.keys(populasiRiskBreakdown);
  const radarValues = Object.values(populasiRiskBreakdown);
  const radarRiskData = {
    labels: radarLabels,
    datasets: [{
      label: 'Debitur Medium/High Risk',
      data: radarValues,
      backgroundColor: 'rgba(0, 210, 255, 0.2)',
      borderColor: '#00f0ff',
      pointBackgroundColor: '#00f0ff',
      pointBorderColor: '#fff',
      borderWidth: 2
    }]
  };

  const radarRiskOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', ...legendStyle }
    },
    scales: {
      r: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: { color: '#8e9bb4', font: { size: 10 } },
        ticks: { color: '#8e9bb4', backdropColor: 'transparent', stepSize: 5 }
      }
    }
  };

  // 4. Trend Prioritas (Line Chart)
  const lineTrendData = {
    labels: periods,
    datasets: trendDatasets
  };

  const lineTrendOptions = {
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

  // 5. Pola Bayar Akhir (Line Chart)
  const linePolaData = {
    labels: periods,
    datasets: polaDatasets
  };

  const linePolaOptions = {
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

  // 6. PS AMBC (Line Chart)
  const linePsData = {
    labels: periods,
    datasets: psDatasets
  };

  const linePsOptions = {
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

  // 7. Selesai vs No Order (Grouped Bar Chart)
  const barSelesaiData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        label: 'Selesai',
        data: [riskNoOrder['Selesai']['Low'], riskNoOrder['Selesai']['Medium'], riskNoOrder['Selesai']['High']],
        backgroundColor: '#0072ff',
        borderRadius: 4
      },
      {
        label: 'No Order',
        data: [riskNoOrder['No Order']['Low'], riskNoOrder['No Order']['Medium'], riskNoOrder['No Order']['High']],
        backgroundColor: '#ec4899',
        borderRadius: 4
      }
    ]
  };

  const barSelesaiOptions = {
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

  const parameterLabels = {
    dti: 'Debt to Income (DTI)',
    payment_delay: 'Keterlambatan Hari',
    credit_score: 'Skor Kredit',
    age: 'Usia Debitur',
    co_burden: 'Beban CO'
  };

  return (
    <div>
      {/* Metrics Row */}
      <section className="metrics-grid">
        {/* Total Debitur */}
        <div className="glass-card metric-card card-total-populasi">
          <div className="metric-icon-box">
            <Users size={20} />
          </div>
          <div>
            <span className="metric-label">Total Debitur</span>
            <div className="metric-value-container">
              <span className="metric-value">{totalPopulation}</span>
              {changes.total.val > 0 && (
                <span className={`metric-change ${changes.total.dir}`}>
                  {changes.total.dir === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {changes.total.val}%
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {changes.compare_label}
          </span>
        </div>

        {/* Risk Population */}
        <div className="glass-card metric-card card-populasi-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-medium)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="metric-label">Populasi Berisiko</span>
            <div className="metric-value-container">
              <span className="metric-value">{riskPopulation}</span>
              {changes.risk.val > 0 && (
                <span className={`metric-change ${changes.risk.dir}`}>
                  {changes.risk.dir === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {changes.risk.val}%
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Medium & High Risk
          </span>
        </div>

        {/* High Risk */}
        <div className="glass-card metric-card card-high-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-high)' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="metric-label">Tinggi Kritis</span>
            <div className="metric-value-container">
              <span className="metric-value">{highRisk}</span>
              {changes.high.val > 0 && (
                <span className={`metric-change ${changes.high.dir}`}>
                  {changes.high.dir === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {changes.high.val}%
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            High Risk Level
          </span>
        </div>

        {/* Low Risk */}
        <div className="glass-card metric-card card-low-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-low)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="metric-label">Rendah Aman</span>
            <div className="metric-value-container">
              <span className="metric-value">{lowRisk}</span>
              {changes.low.val > 0 && (
                <span className={`metric-change ${changes.low.dir}`}>
                  {changes.low.dir === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {changes.low.val}%
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Low Risk Level
          </span>
        </div>

        {/* No Order */}
        <div className="glass-card metric-card card-no-order">
          <div className="metric-icon-box">
            <Ban size={20} />
          </div>
          <div>
            <span className="metric-label">No Order</span>
            <div className="metric-value-container">
              <span className="metric-value">{noOrder}</span>
              {changes.no_order.val > 0 && (
                <span className={`metric-change ${changes.no_order.dir}`}>
                  {changes.no_order.dir === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {changes.no_order.val}%
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Debitur Non-Aktif
          </span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left column: Charts */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Chart row 1 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass-card" style={{ flex: 1, height: '320px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Populasi per Kelas CO
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            <div className="glass-card" style={{ flex: 1.5, height: '320px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Rata-rata Beban CO per Periode
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <Bar data={barBebanData} options={barBebanOptions} />
              </div>
            </div>
          </div>

          {/* Chart row 2 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass-card" style={{ flex: 1, height: '320px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Profil Risiko per Kelas CO
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <Radar data={radarRiskData} options={radarRiskOptions} />
              </div>
            </div>

            <div className="glass-card" style={{ flex: 1.5, height: '320px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Tren Prioritas Debitur
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <Line data={lineTrendData} options={lineTrendOptions} />
              </div>
            </div>
          </div>

          {/* Chart row 3 */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass-card" style={{ flex: 1.25, height: '320px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Pola Bayar Akhir
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <Line data={linePolaData} options={linePolaOptions} />
              </div>
            </div>

            <div className="glass-card" style={{ flex: 1.25, height: '320px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                PS AMBC (SELESAI)
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <Line data={linePsData} options={linePsOptions} />
              </div>
            </div>
          </div>

          {/* Chart row 4 */}
          <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
              Portofolio Risiko: Selesai vs No Order
            </h3>
            <div style={{ flex: 1, position: 'relative' }}>
              <Bar data={barSelesaiData} options={barSelesaiOptions} />
            </div>
          </div>

        </div>

        {/* Right column: Interactive Matrix */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingsIcon size={18} className="text-cyan-500" />
              Diagram Matriks 3x3
            </h3>

            {/* Matrix Form */}
            <form onSubmit={handleApplyMatrix} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="matrixX">Parameter X (Horizontal)</label>
                <select
                  id="matrixX"
                  className="form-control form-select"
                  value={matrixX}
                  onChange={(e) => setMatrixX(e.target.value)}
                >
                  <option value="dti">Debt to Income (DTI)</option>
                  <option value="payment_delay">Hari Keterlambatan</option>
                  <option value="credit_score">Skor Kredit</option>
                  <option value="age">Usia Debitur</option>
                  <option value="co_burden">Beban CO</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="matrixY">Parameter Y (Vertikal)</label>
                <select
                  id="matrixY"
                  className="form-control form-select"
                  value={matrixY}
                  onChange={(e) => setMatrixY(e.target.value)}
                >
                  <option value="dti">Debt to Income (DTI)</option>
                  <option value="payment_delay">Hari Keterlambatan</option>
                  <option value="credit_score">Skor Kredit</option>
                  <option value="age">Usia Debitur</option>
                  <option value="co_burden">Beban CO</option>
                </select>
              </div>

              {user.role === 'admin' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="save_as_default"
                    checked={saveDefault}
                    onChange={(e) => setSaveDefault(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="save_as_default" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Simpan sebagai default sistem
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={refreshing}
              >
                {refreshing ? 'Memproses...' : 'Terapkan Parameter'}
              </button>
            </form>

            {/* Matrix Visual Grid */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  {matrixData.nameY} (Y)
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Y-Axis Label Indicators */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingRight: '8px', height: '220px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-high)' }}>High</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-medium)' }}>Med</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-low)' }}>Low</span>
                  </div>

                  {/* Grid cells */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matrixData.levelsY.map(yLvl => (
                      <div key={yLvl} style={{ display: 'flex', gap: '8px' }}>
                        {matrixData.levelsX.map(xLvl => {
                          const count = matrixData.grid[yLvl][xLvl];
                          
                          // Determine heat cell styling
                          let cellBg = 'rgba(255,255,255,0.02)';
                          let cellBorder = 'var(--border-color)';
                          let textGlow = '';

                          if (yLvl === 'High' && xLvl === 'High') {
                            cellBg = 'rgba(239, 68, 68, 0.25)';
                            cellBorder = 'rgba(239, 68, 68, 0.4)';
                            textGlow = 'var(--color-high)';
                          } else if ((yLvl === 'High' && xLvl === 'Medium') || (yLvl === 'Medium' && xLvl === 'High')) {
                            cellBg = 'rgba(239, 68, 68, 0.15)';
                            cellBorder = 'rgba(239, 68, 68, 0.25)';
                          } else if (yLvl === 'Medium' && xLvl === 'Medium') {
                            cellBg = 'rgba(245, 158, 17, 0.18)';
                            cellBorder = 'rgba(245, 158, 17, 0.3)';
                            textGlow = 'var(--color-medium)';
                          } else if (yLvl === 'Low' && xLvl === 'Low') {
                            cellBg = 'rgba(16, 185, 129, 0.18)';
                            cellBorder = 'rgba(16, 185, 129, 0.3)';
                            textGlow = 'var(--color-low)';
                          }

                          return (
                            <div 
                              key={xLvl} 
                              style={{ 
                                width: '68px', 
                                height: '68px', 
                                background: cellBg, 
                                border: `1px solid ${cellBorder}`, 
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition-smooth)'
                              }}
                            >
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: textGlow || '#fff' }}>{count}</span>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                                {xLvl[0]}-{yLvl[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {/* X-Axis labels */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '68px', textAlign: 'center', color: 'var(--color-low)' }}>Low</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '68px', textAlign: 'center', color: 'var(--color-medium)' }}>Med</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '68px', textAlign: 'center', color: 'var(--color-high)' }}>High</span>
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '1rem' }}>
                  {matrixData.nameX} (X)
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
