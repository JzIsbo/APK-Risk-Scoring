import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import api from '../services/api';

export default function PolaBayar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartPolaRef = useRef(null);
  const chartPsRef = useRef(null);
  const chartDelayRef = useRef(null);

  const chartPolaInst = useRef(null);
  const chartPsInst = useRef(null);
  const chartDelayInst = useRef(null);

  useEffect(() => {
    const loadPolaBayar = async () => {
      try {
        setLoading(true);
        const response = await api.get('/pola-bayar');
        setData(response.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Gagal memuat analisis pola bayar.');
      } finally {
        setLoading(false);
      }
    };

    loadPolaBayar();
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

    const colors = ['#00d2ff', '#0072ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

    // 1. Pola Bayar Akhir (Line Chart)
    if (chartPolaInst.current) chartPolaInst.current.destroy();
    if (chartPolaRef.current) {
      const datasets = Object.keys(data.polaBayarData).map((pat, idx) => ({
        label: pat,
        data: data.polaBayarData[pat],
        borderColor: colors[idx % colors.length],
        tension: 0.3,
        borderWidth: 2
      }));

      chartPolaInst.current = new Chart(chartPolaRef.current, {
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

    // 2. Trend PS AMBC (Line Chart)
    if (chartPsInst.current) chartPsInst.current.destroy();
    if (chartPsRef.current) {
      const datasets = Object.keys(data.psAmbcData).map((ambc, idx) => ({
        label: ambc,
        data: data.psAmbcData[ambc],
        borderColor: colors[(idx + 2) % colors.length],
        tension: 0.3,
        borderWidth: 2
      }));

      chartPsInst.current = new Chart(chartPsRef.current, {
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

    // 3. Average Delay Per Period (Line Chart)
    if (chartDelayInst.current) chartDelayInst.current.destroy();
    if (chartDelayRef.current) {
      chartDelayInst.current = new Chart(chartDelayRef.current, {
        type: 'line',
        data: {
          labels: data.periodLabels,
          datasets: [{
            label: 'Rata-rata Keterlambatan (Hari)',
            data: data.avgDelayPerPeriod,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.05)',
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

    return () => {
      if (chartPolaInst.current) chartPolaInst.current.destroy();
      if (chartPsInst.current) chartPsInst.current.destroy();
      if (chartDelayInst.current) chartDelayInst.current.destroy();
    };
  }, [data, loading]);

  if (loading && !data) return <div className="loading-container">Memuat pola bayar...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { patternSummary, psAmbcSummary, noOrderByPattern, crossTab } = data;

  return (
    <>
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Trend Pola Bayar */}
        <div className="glass-card col-4">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Tren Pola Bayar Akhir</h3>
          <div style={{ height: '220px' }}>
            <canvas ref={chartPolaRef}></canvas>
          </div>
        </div>

        {/* Trend PS AMBC */}
        <div className="glass-card col-4">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Tren Kategori PS AMBC</h3>
          <div style={{ height: '220px' }}>
            <canvas ref={chartPsRef}></canvas>
          </div>
        </div>

        {/* Average Delay */}
        <div className="glass-card col-4">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Rata-rata Keterlambatan (Hari)</h3>
          <div style={{ height: '220px' }}>
            <canvas ref={chartDelayRef}></canvas>
          </div>
        </div>
      </div>

      {/* Row 2: Tables of Summaries */}
      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* Pattern Summary */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distribusi Risiko Berdasarkan Pola Bayar</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px' }}>Pola Bayar</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Total Debitur</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>High Risk</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Avg Delay</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Rata-rata Skor</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(patternSummary).map(pat => {
                  const row = patternSummary[pat];
                  return (
                    <tr key={pat} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{pat}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.total}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-high)', fontWeight: 'bold' }}>{row.high_risk}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.avg_delay.toFixed(1)} Hari</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{row.avg_score.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PS AMBC Summary */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distribusi Risiko Berdasarkan PS AMBC</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px' }}>PS AMBC</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Total Debitur</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>High Risk</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Rata-rata Skor</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(psAmbcSummary).map(ambc => {
                  const row = psAmbcSummary[ambc];
                  return (
                    <tr key={ambc} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{ambc}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{row.total}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-high)', fontWeight: 'bold' }}>{row.high_risk}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{row.avg_score.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Status Breakdown & Cross Tabulation */}
      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* Status Breakdown by Pattern */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Breakdown Status per Pola Bayar</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px' }}>Pola Bayar</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>No Order (Belum Selesai)</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Active</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Settled (Selesai)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(noOrderByPattern).map(pat => {
                  const row = noOrderByPattern[pat];
                  return (
                    <tr key={pat} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{pat}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-medium)', fontWeight: 'bold' }}>{row.no_order}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-blue)' }}>{row.active}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-low)' }}>{row.settled}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cross Tabulation Matrix */}
        <div className="glass-card col-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matriks Hubungan: Pola Bayar &times; PS AMBC</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px' }}>Pola Bayar \ PS AMBC</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>PS-1</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>PS-2</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>PS-3</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>PS-4</th>
                </tr>
              </thead>
              <tbody>
                {['L3', 'L4', 'L5'].map(pat => {
                  return (
                    <tr key={pat} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{pat}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{(crossTab[pat] && crossTab[pat]['PS-1']) || 0}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{(crossTab[pat] && crossTab[pat]['PS-2']) || 0}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{(crossTab[pat] && crossTab[pat]['PS-3']) || 0}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>{(crossTab[pat] && crossTab[pat]['PS-4']) || 0}</td>
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
