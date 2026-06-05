import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import api from '../services/api';

export default function RiskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/risk-analysis/${id}`);
        setData(response.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail analisis debitur.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  useEffect(() => {
    if (!data || loading || !chartRef.current) return;

    // Destroy existing chart to prevent canvas overlay
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Shortened labels to prevent boundary text clipping
    const shortLabels = ['DTI', 'Keterlambatan', 'Skor Kredit', 'Usia', 'Beban CO'];

    // Map parameters breakdown to radar values
    // Order: dti, payment_delay, credit_score, age, co_burden
    const orderedKeys = ['dti', 'payment_delay', 'credit_score', 'age', 'co_burden'];
    const radarValues = orderedKeys.map(key => {
      const param = data.breakdown.find(b => b.key === key);
      return param ? param.score : 0;
    });

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: shortLabels,
        datasets: [{
          label: 'Skor Parameter',
          data: radarValues,
          backgroundColor: data.population.risk_level === 'High' 
            ? 'rgba(239, 68, 68, 0.2)' 
            : data.population.risk_level === 'Medium'
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(16, 185, 129, 0.2)',
          borderColor: data.population.risk_level === 'High' 
            ? '#ef4444' 
            : data.population.risk_level === 'Medium'
              ? '#f59e0b'
              : '#10b981',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 24 // Substantial padding to prevent label clipping
        },
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#8e9bb4',
              font: {
                family: 'Plus Jakarta Sans',
                size: 10,
                weight: 'bold'
              }
            },
            ticks: {
              display: false,
              stepSize: 1
            },
            min: 0,
            max: 3 // Score scales are typically 1, 2, 3
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, loading]);

  if (loading && !data) return <div className="loading-container">Memuat detail debitur...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { population, breakdown, similar } = data;

  const riskColors = population.risk_level === 'High'
    ? { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5' }
    : population.risk_level === 'Medium'
      ? { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#fde047' }
      : { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#a7f3d0' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i> Kembali ke Analisis
        </button>
      </div>

      <div className="dashboard-grid" style={{ gap: '20px' }}>
        {/* Left Column: Debtor Profile Info Card */}
        <div className="glass-card col-4" style={{ height: 'fit-content' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--color-cyan)' }}>
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>{population.name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID Debitur: #{population.id}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status Debitur</span>
              <strong style={{ color: 'white' }}>{population.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Periode Data</span>
              <strong style={{ color: 'white' }}>{population.period}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Kelas CO</span>
              <strong style={{ color: 'white' }}>{population.co_class}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pola Bayar Akhir</span>
              <strong style={{ color: 'white' }}>{population.payment_pattern}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Kategori PS AMBC</span>
              <strong style={{ color: 'white' }}>{population.ps_ambc}</strong>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '6px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${riskColors.border}`, background: riskColors.bg, textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Tingkat Risiko Terkalkulasi</span>
                <strong style={{ display: 'block', fontSize: '1.4rem', color: riskColors.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{population.risk_level}</strong>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'white', marginTop: '6px' }}>{population.risk_score.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Parameters Weight Contribution Table */}
        <div className="glass-card col-4">
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>Detail Penilaian Parameter</h4>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 8px' }}>Parameter</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>Nilai</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>Skor</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>Bobot</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Kontribusi</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item, idx) => {
                  let badgeColor = item.score === 3 
                    ? '#fca5a5' 
                    : item.score === 2 
                      ? '#fde047' 
                      : '#a7f3d0';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: 'white' }}>
                        {item.key === 'dti' || item.key === 'co_burden' ? `${item.value}%` : item.key === 'payment_delay' ? `${item.value} Hari` : item.value}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: badgeColor }}>{item.score}</span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>{item.weight}%</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-cyan)' }}>{item.contribution.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '20px', lineHeight: '1.4' }}>
            <strong>Rumus Kalkulasi:</strong>
            <div style={{ fontFamily: 'monospace', color: 'var(--color-cyan)', marginTop: '4px' }}>
              Skor Risiko = &Sigma; (Skor Parameter &times; Bobot / 100) &times; 33.33
            </div>
            <div style={{ marginTop: '4px' }}>
              Hasil akhir dinormalisasi ke skala 0 - 100.
            </div>
          </div>
        </div>

        {/* Right Column: Radar Chart and Similar Risk Debtors */}
        <div className="glass-card col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Visualisasi Radar Parameter</h4>
            <div style={{ position: 'relative', height: '240px', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Debitur Sejenis ({population.risk_level} Risk)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {similar.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ditemukan debitur pembanding.</span>
              ) : (
                similar.map(sim => (
                  <div key={sim.id} onClick={() => navigate(`/risk-analysis/${sim.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--transition-smooth)' }} className="similar-row">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sim.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{sim.risk_score.toFixed(2)}</span>
                      <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}></i>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
