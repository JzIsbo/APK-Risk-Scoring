import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import api from '../services/api';

export default function LaporanPrint() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartCoRef = useRef(null);
  const chartCoInst = useRef(null);

  const period = searchParams.get('period') || '';
  const coClass = searchParams.get('co_class') || '';
  const riskLevel = searchParams.get('risk_level') || '';

  useEffect(() => {
    const loadPrintData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (period) params.period = period;
        if (coClass) params.co_class = coClass;
        if (riskLevel) params.risk_level = riskLevel;

        const response = await api.get('/laporan/pdf-data', { params });
        setData(response.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data cetak PDF.');
      } finally {
        setLoading(false);
      }
    };

    loadPrintData();
  }, [period, coClass, riskLevel]);

  useEffect(() => {
    if (!data || loading || !chartCoRef.current) return;

    if (chartCoInst.current) {
      chartCoInst.current.destroy();
    }

    // Set up printable Chart.js (NO animations so it renders instantly for print)
    const ctx = chartCoRef.current.getContext('2d');
    
    // Prepare bar chart data based on riskByCo
    const classes = Object.keys(data.riskByCo);
    const highData = classes.map(c => data.riskByCo[c]['High'] || 0);
    const mediumData = classes.map(c => data.riskByCo[c]['Medium'] || 0);
    const lowData = classes.map(c => data.riskByCo[c]['Low'] || 0);

    chartCoInst.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: classes,
        datasets: [
          { label: 'Low Risk', data: lowData, backgroundColor: '#00cc77', borderRadius: 2 },
          { label: 'Medium Risk', data: mediumData, backgroundColor: '#ffaa00', borderRadius: 2 },
          { label: 'High Risk', data: highData, backgroundColor: '#ff3333', borderRadius: 2 }
        ]
      },
      options: {
        animation: false, // CRITICAL: Disable animation for synchronous print rendering
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#334155', font: { size: 10 } }
          }
        },
        scales: {
          x: { ticks: { color: '#334155' } },
          y: { ticks: { color: '#334155' } }
        }
      }
    });

    // Trigger printing after paint cycle
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (chartCoInst.current) {
        chartCoInst.current.destroy();
      }
    };
  }, [data, loading]);

  if (loading && !data) return <div style={{ padding: '40px', textAlign: 'center', color: '#334155' }}>Menyiapkan dokumen cetak...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red' }}>{error}</div>;

  const { populations, summaryStats } = data;

  return (
    <div className="print-document" style={{
      background: 'white',
      color: '#0f172a',
      padding: '30px',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Print styles to hide main app wrappers */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print-document {
            padding: 0 !important;
            max-width: 100% !important;
          }
          /* Hide standard elements */
          #theme-toggle, .sidebar, .top-header, .header-actions {
            display: none !important;
          }
        }
      `}</style>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e293b' }}>Laporan Analisis Risiko Debitur</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sistem Dashboard Monitoring Risiko Real-Time</span>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
          <div>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</div>
          <div>Filter: {period || 'Semua Periode'} {coClass ? ` | CO: ${coClass}` : ''} {riskLevel ? ` | Risk: ${riskLevel}` : ''}</div>
        </div>
      </div>

      {/* Summary stats boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total Debitur</span>
          <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{summaryStats.filtered}</strong>
        </div>
        <div style={{ padding: '12px', border: '1px solid #fecaca', borderRadius: '8px', background: '#fef2f2', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#b91c1c', textTransform: 'uppercase' }}>High Risk</span>
          <strong style={{ fontSize: '1.25rem', color: '#991b1b' }}>{summaryStats.high}</strong>
        </div>
        <div style={{ padding: '12px', border: '1px solid #fde68a', borderRadius: '8px', background: '#fffbeb', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#b45309', textTransform: 'uppercase' }}>Medium Risk</span>
          <strong style={{ fontSize: '1.25rem', color: '#92400e' }}>{summaryStats.medium}</strong>
        </div>
        <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Rerata Skor</span>
          <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>{summaryStats.avg_score.toFixed(2)}</strong>
        </div>
      </div>

      {/* Chart Block */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', textTransform: 'uppercase', color: '#1e293b' }}>Distribusi Risiko per Kelas CO</h3>
        <div style={{ height: '200px', width: '100%' }}>
          <canvas ref={chartCoRef}></canvas>
        </div>
      </div>

      {/* Detail Table */}
      <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase', color: '#1e293b' }}>Daftar Debitur Analisis</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
            <th style={{ padding: '8px 10px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>No.</th>
            <th style={{ padding: '8px 10px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Nama Debitur</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Usia</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>DTI</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Delay</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Kredit</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Beban CO</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>Skor</th>
            <th style={{ padding: '8px 10px', textAlign: 'center' }}>Tingkat Risiko</th>
          </tr>
        </thead>
        <tbody>
          {populations.map((pop, idx) => (
            <tr key={pop.id} style={{ borderBottom: '1px solid #cbd5e1', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
              <td style={{ padding: '6px 10px', borderRight: '1px solid #cbd5e1' }}>{idx + 1}</td>
              <td style={{ padding: '6px 10px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>{pop.name}</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{pop.age} Thn</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{pop.dti}%</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{pop.payment_delay} Hari</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{pop.credit_score}</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{pop.co_burden}%</td>
              <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb', borderRight: '1px solid #cbd5e1' }}>{pop.risk_score.toFixed(2)}</td>
              <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: pop.risk_level === 'High' ? '#b91c1c' : pop.risk_level === 'Medium' ? '#b45309' : '#047857' }}>
                  {pop.risk_level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
