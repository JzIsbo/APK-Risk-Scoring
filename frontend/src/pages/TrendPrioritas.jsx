import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import api from '../services/api';

export default function TrendPrioritas() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartLevelRef = useRef(null);
  const chartClassRef = useRef(null);
  const chartScoreRef = useRef(null);
  const chartDtiRef = useRef(null);

  const chartLevelInst = useRef(null);
  const chartClassInst = useRef(null);
  const chartScoreInst = useRef(null);
  const chartDtiInst = useRef(null);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        setLoading(true);
        const response = await api.get('/trend-prioritas');
        setData(response.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data tren prioritas.');
      } finally {
        setLoading(false);
      }
    };

    loadTrend();
  }, []);

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
        font: { family: 'Plus Jakarta Sans', size: 10 },
        boxWidth: 10,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    };

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#00d2ff', '#0072ff', '#8b5cf6'];

    // 1. Trend by Risk Level (Line Chart)
    if (chartLevelInst.current) chartLevelInst.current.destroy();
    if (chartLevelRef.current) {
      const datasets = Object.keys(data.trendRisk).map((lvl, idx) => ({
        label: lvl + ' Risk',
        data: data.trendRisk[lvl],
        borderColor: lvl === 'High' ? '#ef4444' : lvl === 'Medium' ? '#f59e0b' : '#10b981',
        tension: 0.3,
        borderWidth: 2
      }));

      chartLevelInst.current = new Chart(chartLevelRef.current, {
        type: 'line',
        data: { labels: data.periodLabels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } }
          }
        }
      });
    }

    // 2. Trend by CO Class (Line Chart)
    if (chartClassInst.current) chartClassInst.current.destroy();
    if (chartClassRef.current) {
      const datasets = Object.keys(data.trendPrioritas).map((cls, idx) => ({
        label: cls,
        data: data.trendPrioritas[cls],
        borderColor: colors[(idx + 3) % colors.length],
        tension: 0.3,
        borderWidth: 2
      }));

      chartClassInst.current = new Chart(chartClassRef.current, {
        type: 'line',
        data: { labels: data.periodLabels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } }
          }
        }
      });
    }

    // 3. Average Risk Score (Line Chart)
    if (chartScoreInst.current) chartScoreInst.current.destroy();
    if (chartScoreRef.current) {
      chartScoreInst.current = new Chart(chartScoreRef.current, {
        type: 'line',
        data: {
          labels: data.periodLabels,
          datasets: [{
            label: 'Rata-rata Skor Risiko',
            data: data.avgRiskScore,
            borderColor: '#00d2ff',
            backgroundColor: 'rgba(0, 210, 255, 0.05)',
            tension: 0.4,
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } }
          }
        }
      });
    }

    // 4. Average DTI by CO Class (Line Chart)
    if (chartDtiInst.current) chartDtiInst.current.destroy();
    if (chartDtiRef.current) {
      const datasets = Object.keys(data.avgDtiByClass).map((cls, idx) => ({
        label: cls,
        data: data.avgDtiByClass[cls],
        borderColor: colors[(idx + 4) % colors.length],
        tension: 0.3,
        borderWidth: 2
      }));

      chartDtiInst.current = new Chart(chartDtiRef.current, {
        type: 'line',
        data: { labels: data.periodLabels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', ...legendStyle } },
          scales: {
            x: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } },
            y: { grid: gridStyle, ticks: { color: '#8e9bb4', font: { size: 9 } } }
          }
        }
      });
    }

    return () => {
      if (chartLevelInst.current) chartLevelInst.current.destroy();
      if (chartClassInst.current) chartClassInst.current.destroy();
      if (chartScoreInst.current) chartScoreInst.current.destroy();
      if (chartDtiInst.current) chartDtiInst.current.destroy();
    };
  }, [data, loading]);

  if (loading && !data) return <div className="loading-container">Memuat tren...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { coBreakdown, growthData } = data;

  return (
    <>
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Trend Tingkat Risiko */}
        <div className="glass-card col-6">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Tren Tingkat Risiko per Periode</h3>
          <div style={{ height: '230px' }}>
            <canvas ref={chartLevelRef}></canvas>
          </div>
        </div>

        {/* Trend Kelas CO */}
        <div className="glass-card col-6">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Tren Populasi per Kelas CO</h3>
          <div style={{ height: '230px' }}>
            <canvas ref={chartClassRef}></canvas>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Rata-rata Skor Risiko */}
        <div className="glass-card col-6">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Rerata Skor Risiko Keseluruhan</h3>
          <div style={{ height: '230px' }}>
            <canvas ref={chartScoreRef}></canvas>
          </div>
        </div>

        {/* Rata-rata DTI */}
        <div className="glass-card col-6">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Rerata Rasio Utang (DTI %) per Kelas CO</h3>
          <div style={{ height: '230px' }}>
            <canvas ref={chartDtiRef}></canvas>
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* MoM Growth Table */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pertumbuhan Month-over-Month (MoM)</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px' }}>Kelas CO</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Periode Lalu</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Periode Ini</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Selisih</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Pertumbuhan MoM</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(growthData).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Kurang data periode pembanding.</td>
                  </tr>
                ) : (
                  Object.keys(growthData).map(cls => {
                    const row = growthData[cls];
                    const isPositive = row.diff >= 0;
                    return (
                      <tr key={cls} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 600 }}>{cls}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.prev}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.curr}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 'bold', color: isPositive ? 'var(--color-high)' : 'var(--color-low)' }}>
                          {isPositive ? `+${row.diff}` : row.diff}
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold', color: isPositive ? 'var(--color-high)' : 'var(--color-low)' }}>
                          {isPositive ? `+${row.pct}%` : `${row.pct}%`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CO Class Breakdown stats */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detail Konsentrasi Risiko per Kelas CO</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px' }}>Kelas CO</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>High</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Medium</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Low</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Avg DTI</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Avg Skor</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(coBreakdown).map(cls => {
                  const row = coBreakdown[cls];
                  return (
                    <tr key={cls} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{cls}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.total}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-high)', fontWeight: 'bold' }}>{row.high}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-medium)', fontWeight: 'bold' }}>{row.medium}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-low)', fontWeight: 'bold' }}>{row.low}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.avg_dti}%</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{row.avg_score.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
