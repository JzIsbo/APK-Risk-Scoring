import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Chart from 'chart.js/auto';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Matrix settings state
  const [matrixX, setMatrixX] = useState('payment_delay');
  const [matrixY, setMatrixY] = useState('dti');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [matrixMsg, setMatrixMsg] = useState('');

  // Chart ref pointers
  const chartCoRef = useRef(null);
  const chartBebanRef = useRef(null);
  const chartRadarRef = useRef(null);
  const chartTrendRef = useRef(null);
  const chartPolaRef = useRef(null);
  const chartPsRef = useRef(null);
  const chartNoOrderRef = useRef(null);

  // Active chart instances
  const chartCoInst = useRef(null);
  const chartBebanInst = useRef(null);
  const chartRadarInst = useRef(null);
  const chartTrendInst = useRef(null);
  const chartPolaInst = useRef(null);
  const chartPsInst = useRef(null);
  const chartNoOrderInst = useRef(null);

  // Load dashboard data
  const loadDashboard = async (xParam = null, yParam = null) => {
    try {
      setLoading(true);
      let url = '/dashboard';
      const queryParams = [];
      if (xParam) queryParams.push(`matrix_x_param=${xParam}`);
      if (yParam) queryParams.push(`matrix_y_param=${yParam}`);
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await api.get(url);
      setData(response.data);
      setMatrixX(response.data.matrixSettings.matrixX);
      setMatrixY(response.data.matrixSettings.matrixY);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Update Matrix Settings
  const handleMatrixSubmit = async (e) => {
    e.preventDefault();
    setMatrixMsg('');
    
    // 1. Reload dashboard with selected filters
    await loadDashboard(matrixX, matrixY);

    // 2. If saveAsDefault and user is admin, post defaults
    if (saveAsDefault && user.role === 'admin') {
      try {
        await api.post('/dashboard/matrix-settings', {
          matrix_x_param: matrixX,
          matrix_y_param: matrixY,
        });
        setMatrixMsg('Pengaturan default diagram matriks berhasil disimpan ke sistem!');
      } catch (err) {
        console.error(err);
        setMatrixMsg('Gagal menyimpan pengaturan default.');
      }
    }
  };

  // Render Chart.js instances on data update
  useEffect(() => {
    if (!data || loading) return;

    const gridStyle = {
      color: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      drawTicks: false
    };
    
    const legendStyle = {
      labels: {
        color: '#8e9bb4',
        font: {
          family: 'Plus Jakarta Sans',
          size: 10
        },
        boxWidth: 10,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    };

    // Helper to destroy previous chart
    const destroyChart = (chartRef) => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };

    // 1. Populasi CO Donut
    destroyChart(chartCoInst);
    if (chartCoRef.current) {
      chartCoInst.current = new Chart(chartCoRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(data.populasiCo),
          datasets: [{
            data: Object.values(data.populasiCo),
            backgroundColor: ['#00d2ff', '#0072ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom', ...legendStyle }
          }
        }
      });
    }

    // 2. Populasi Beban CO Grouped Bar
    destroyChart(chartBebanInst);
    if (chartBebanRef.current) {
      chartBebanInst.current = new Chart(chartBebanRef.current, {
        type: 'bar',
        data: {
          labels: data.periods,
          datasets: data.bebanDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', ...legendStyle }
          },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } }
          }
        }
      });
    }

    // 3. Populasi Risk Radar
    destroyChart(chartRadarInst);
    if (chartRadarRef.current) {
      chartRadarInst.current = new Chart(chartRadarRef.current, {
        type: 'radar',
        data: {
          labels: Object.keys(data.populasiRiskBreakdown),
          datasets: [{
            label: 'Risk Distribution',
            data: Object.values(data.populasiRiskBreakdown),
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
            borderWidth: 2,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#ef4444'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
              grid: { color: 'rgba(255, 255, 255, 0.08)' },
              pointLabels: { color: '#8e9bb4', font: { size: 10 } },
              ticks: { display: false }
            }
          }
        }
      });
    }

    // 4. Trend Prioritas Line
    destroyChart(chartTrendInst);
    if (chartTrendRef.current) {
      chartTrendInst.current = new Chart(chartTrendRef.current, {
        type: 'line',
        data: {
          labels: data.periods,
          datasets: data.trendDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
          }
        }
      });
    }

    // 5. Pola Bayar Akhir Line
    destroyChart(chartPolaInst);
    if (chartPolaRef.current) {
      chartPolaInst.current = new Chart(chartPolaRef.current, {
        type: 'line',
        data: {
          labels: data.periods,
          datasets: data.polaDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
          }
        }
      });
    }

    // 6. PS AMBC Line
    destroyChart(chartPsInst);
    if (chartPsRef.current) {
      chartPsInst.current = new Chart(chartPsRef.current, {
        type: 'line',
        data: {
          labels: data.periods,
          datasets: data.psDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
          }
        }
      });
    }

    // 7. Populasi Risk No Order vs Selesai Bar
    destroyChart(chartNoOrderInst);
    if (chartNoOrderRef.current) {
      chartNoOrderInst.current = new Chart(chartNoOrderRef.current, {
        type: 'bar',
        data: {
          labels: ['Low', 'Medium', 'High'],
          datasets: [
            {
              label: 'Belum Selesai (No Order)',
              data: [
                data.riskNoOrder['No Order']['Low'],
                data.riskNoOrder['No Order']['Medium'],
                data.riskNoOrder['No Order']['High']
              ],
              backgroundColor: 'rgba(245, 158, 11, 0.85)',
              borderRadius: 4
            },
            {
              label: 'Selesai',
              data: [
                data.riskNoOrder['Selesai']['Low'],
                data.riskNoOrder['Selesai']['Medium'],
                data.riskNoOrder['Selesai']['High']
              ],
              backgroundColor: 'rgba(0, 114, 255, 0.85)',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 8 } } }
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      destroyChart(chartCoInst);
      destroyChart(chartBebanInst);
      destroyChart(chartRadarInst);
      destroyChart(chartTrendInst);
      destroyChart(chartPolaInst);
      destroyChart(chartPsInst);
      destroyChart(chartNoOrderInst);
    };
  }, [data, loading]);

  const handleCellClick = (riskLvl) => {
    navigate(`/risk-analysis?risk_level=${riskLvl}`);
  };

  if (loading && !data) return <div className="loading-container">Memuat dasbor...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { metrics, matrixSettings } = data;
  const matrixData = matrixSettings.matrixData;

  return (
    <>
      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        {/* Total Populasi */}
        <div className="glass-card metric-card card-total-populasi">
          <div className="metric-icon-box" style={{ color: 'var(--color-cyan)' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <span className="metric-label">Total Populasi</span>
            <div className="metric-value-container">
              <span className="metric-value">{metrics.totalPopulation.toLocaleString('id-ID')}</span>
              <span className={`metric-change ${metrics.changes.total.dir}`}>
                <i className={`fa-solid fa-caret-${metrics.changes.total.dir}`}></i>
                {metrics.changes.total.dir === 'up' ? '+' : '-'}{metrics.changes.total.val}%
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.changes.compare_label}</span>
          </div>
        </div>

        {/* Populasi Risk */}
        <div className="glass-card metric-card card-populasi-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-medium)' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <span className="metric-label">Populasi Risk</span>
            <div className="metric-value-container">
              <span className="metric-value">{metrics.riskPopulation.toLocaleString('id-ID')}</span>
              <span className={`metric-change ${metrics.changes.risk.dir}`}>
                <i className={`fa-solid fa-caret-${metrics.changes.risk.dir}`}></i>
                {metrics.changes.risk.dir === 'up' ? '+' : '-'}{metrics.changes.risk.val}%
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.changes.compare_label}</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="glass-card metric-card card-high-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-high)' }}>
            <i className="fa-solid fa-radiation"></i>
          </div>
          <div>
            <span className="metric-label">High Risk</span>
            <div className="metric-value-container">
              <span className="metric-value">{metrics.highRisk.toLocaleString('id-ID')}</span>
              <span className={`metric-change ${metrics.changes.high.dir}`}>
                <i className={`fa-solid fa-caret-${metrics.changes.high.dir}`}></i>
                {metrics.changes.high.dir === 'up' ? '+' : '-'}{metrics.changes.high.val}%
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.changes.compare_label}</span>
          </div>
        </div>

        {/* Low Risk */}
        <div className="glass-card metric-card card-low-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-low)' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <span className="metric-label">Low Risk</span>
            <div className="metric-value-container">
              <span className="metric-value">{metrics.lowRisk.toLocaleString('id-ID')}</span>
              <span className={`metric-change ${metrics.changes.low.dir}`}>
                <i className={`fa-solid fa-caret-${metrics.changes.low.dir}`}></i>
                {metrics.changes.low.dir === 'up' ? '+' : '-'}{metrics.changes.low.val}%
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.changes.compare_label}</span>
          </div>
        </div>

        {/* No Order */}
        <div className="glass-card metric-card card-no-order">
          <div className="metric-icon-box" style={{ color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-ban"></i>
          </div>
          <div>
            <span className="metric-label">No Order</span>
            <div className="metric-value-container">
              <span className="metric-value">{metrics.noOrder.toLocaleString('id-ID')}</span>
              <span className={`metric-change ${metrics.changes.no_order.dir}`}>
                <i className={`fa-solid fa-caret-${metrics.changes.no_order.dir}`}></i>
                {metrics.changes.no_order.dir === 'up' ? '+' : '-'}{metrics.changes.no_order.val}%
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.changes.compare_label}</span>
          </div>
        </div>
      </div>

      {/* Charts Section Row 1 */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Populasi CO */}
        <div className="glass-card col-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Populasi CO</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {data.periods[0]} - {data.periods[data.periods.length - 1]}
            </span>
          </div>
          <div style={{ position: 'relative', height: '220px', width: '100%' }}>
            <canvas ref={chartCoRef}></canvas>
          </div>
        </div>

        {/* Populasi Beban CO */}
        <div className="glass-card col-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rasio Beban CO (%)</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RATA-RATA BULANAN</span>
          </div>
          <div style={{ height: '220px' }}>
            <canvas ref={chartBebanRef}></canvas>
          </div>
        </div>

        {/* Populasi Risk Radar */}
        <div className="glass-card col-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Populasi Risk</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Radar Analisis</span>
          </div>
          <div style={{ position: 'relative', height: '220px', width: '100%' }}>
            <canvas ref={chartRadarRef}></canvas>
          </div>
        </div>
      </div>

      {/* Charts Section Row 2 */}
      <div className="dashboard-grid">
        {/* Trend Prioritas */}
        <div className="glass-card col-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trend Prioritas</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AMBC (SELESAI) / BULAN</span>
          </div>
          <div style={{ height: '180px' }}>
            <canvas ref={chartTrendRef}></canvas>
          </div>
        </div>

        {/* Pola Bayar Akhir */}
        <div className="glass-card col-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pola Bayar Akhir</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AMBC (SELESAI) / BULAN</span>
          </div>
          <div style={{ height: '180px' }}>
            <canvas ref={chartPolaRef}></canvas>
          </div>
        </div>

        {/* PS AMBC */}
        <div className="glass-card col-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PS AMBC (SELESAI)</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AC / BULAN</span>
          </div>
          <div style={{ height: '180px' }}>
            <canvas ref={chartPsRef}></canvas>
          </div>
        </div>

        {/* Populasi Risk - No Order */}
        <div className="glass-card col-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Populasi Risk - No Order</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {data.periods[0]} - {data.periods[data.periods.length - 1]}
            </span>
          </div>
          <div style={{ height: '180px' }}>
            <canvas ref={chartNoOrderRef}></canvas>
          </div>
        </div>
      </div>

      {/* Row 3: Matrix Diagram & Settings */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Matrix Diagram Card */}
        <div className="glass-card col-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matriks Analisis Risiko</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sumbu Y (Vertikal): <strong>{matrixData.nameY}</strong> &nbsp;|&nbsp; Sumbu X (Horizontal): <strong>{matrixData.nameX}</strong>
              </span>
            </div>
            <span className="badge badge-status" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-table-cells-large"></i> 3 &times; 3 Heatmap
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', alignItems: 'center' }}>
            {/* Y-Axis Labels Column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '260px', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right', paddingRight: '12px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-high)' }}>HIGH</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Tinggi)</span>
              </div>
              <div style={{ height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-medium)' }}>MEDIUM</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Sedang)</span>
              </div>
              <div style={{ height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-low)' }}>LOW</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Rendah)</span>
              </div>
            </div>

            {/* 3x3 Heatmap Grid */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 80px)', gap: '10px' }}>
              {/* Row 1: High Y */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', height: '80px' }}>
                {/* High Y, Low X (Orange/Medium) */}
                <div className="matrix-cell" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('Medium')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>{matrixData.grid.High.Low}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Medium Risk</span>
                </div>
                {/* High Y, Medium X (Red/High) */}
                <div className="matrix-cell" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('High')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-display)' }}>{matrixData.grid.High.Medium}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>High Risk</span>
                </div>
                {/* High Y, High X (Red/High) */}
                <div className="matrix-cell" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }} onClick={() => handleCellClick('High')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff5c5c', fontFamily: 'var(--font-display)' }}>{matrixData.grid.High.High}</span>
                  <span style={{ fontSize: '0.62rem', color: '#ff8888', textTransform: 'uppercase', fontWeight: 700 }}>Extreme Risk</span>
                </div>
              </div>

              {/* Row 2: Medium Y */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', height: '80px' }}>
                {/* Medium Y, Low X (Green/Low) */}
                <div className="matrix-cell" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('Low')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>{matrixData.grid.Medium.Low}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Low Risk</span>
                </div>
                {/* Medium Y, Medium X (Orange/Medium) */}
                <div className="matrix-cell" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('Medium')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>{matrixData.grid.Medium.Medium}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Medium Risk</span>
                </div>
                {/* Medium Y, High X (Red/High) */}
                <div className="matrix-cell" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('High')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-display)' }}>{matrixData.grid.Medium.High}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>High Risk</span>
                </div>
              </div>

              {/* Row 3: Low Y */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', height: '80px' }}>
                {/* Low Y, Low X (Green/Low) */}
                <div className="matrix-cell" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('Low')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>{matrixData.grid.Low.Low}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Safe (Low)</span>
                </div>
                {/* Low Y, Medium X (Green/Low) */}
                <div className="matrix-cell" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('Low')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>{matrixData.grid.Low.Medium}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Low Risk</span>
                </div>
                {/* Low Y, High X (Orange/Medium) */}
                <div className="matrix-cell" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySpace: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)', cursor: 'pointer' }} onClick={() => handleCellClick('Medium')}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>{matrixData.grid.Low.High}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Medium Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* X-Axis Labels Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginTop: '10px' }}>
            <div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <div>
                <span>LOW</span>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Rendah)</div>
              </div>
              <div>
                <span>MEDIUM</span>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Sedang)</div>
              </div>
              <div>
                <span>HIGH</span>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Tinggi)</div>
              </div>
            </div>
          </div>

          {/* X-Axis Parameter Name Title */}
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Parameter Horizontal (X): <strong>{matrixData.nameX}</strong>
          </div>
        </div>

        {/* Settings Card */}
        <div className="glass-card col-4">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
            <i className="fa-solid fa-sliders" style={{ color: 'var(--color-purple)', marginRight: '6px' }}></i> Pengaturan Matriks
          </h3>

          {matrixMsg && (
            <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: '0.8rem', marginBottom: '1rem', borderRadius: '8px' }}>
              <i className="fa-solid fa-circle-check"></i> {matrixMsg}
            </div>
          )}

          <form onSubmit={handleMatrixSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Sumbu Y (Vertikal)</label>
              <select value={matrixY} onChange={e => setMatrixY(e.target.value)} className="form-control form-select" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                <option value="dti" style={{ background: '#0f172a', color: 'white' }}>Rasio Utang (DTI)</option>
                <option value="payment_delay" style={{ background: '#0f172a', color: 'white' }}>Keterlambatan Pembayaran</option>
                <option value="credit_score" style={{ background: '#0f172a', color: 'white' }}>Skor Kredit</option>
                <option value="co_burden" style={{ background: '#0f172a', color: 'white' }}>Beban CO</option>
                <option value="age" style={{ background: '#0f172a', color: 'white' }}>Usia Debitur</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Sumbu X (Horizontal)</label>
              <select value={matrixX} onChange={e => setMatrixX(e.target.value)} className="form-control form-select" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                <option value="dti" style={{ background: '#0f172a', color: 'white' }}>Rasio Utang (DTI)</option>
                <option value="payment_delay" style={{ background: '#0f172a', color: 'white' }}>Keterlambatan Pembayaran</option>
                <option value="credit_score" style={{ background: '#0f172a', color: 'white' }}>Skor Kredit</option>
                <option value="co_burden" style={{ background: '#0f172a', color: 'white' }}>Beban CO</option>
                <option value="age" style={{ background: '#0f172a', color: 'white' }}>Usia Debitur</option>
              </select>
            </div>

            {user.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.25rem' }}>
                <input type="checkbox" checked={saveAsDefault} onChange={e => setSaveAsDefault(e.target.checked)} id="save_as_default" style={{ width: '16px', height: '16px', accentColor: 'var(--color-blue)', cursor: 'pointer' }} />
                <label htmlFor="save_as_default" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>Simpan sebagai default sistem</label>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem', padding: '12px 20px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', color: '#050b1a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 240, 255, 0.15)' }}>
              <i className="fa-solid fa-rotate"></i> Terapkan & Segarkan
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
