import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LaporanPrint = () => {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse query parameters
  const query = new URLSearchParams(location.search);
  const period = query.get('period') || '';
  const coClass = query.get('co_class') || '';
  const riskLevel = query.get('risk_level') || '';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Retrieve all records for print by setting per_page=5000
        const res = await api.get(`/laporan?per_page=5000&period=${period}&co_class=${coClass}&risk_level=${riskLevel}`);
        setData(res.data);
      } catch (err) {
        console.error('Print fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [location.search]);

  // Trigger print dialog after DOM loads and charts render
  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => {
        window.print();
      }, 800); // Wait for canvas chart drawing animation
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3>Menyiapkan Laporan Cetak...</h3>
        <p style={{ color: '#666' }}>Harap tunggu sebentar.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif', color: 'red' }}>
        <h3>Error memuat data print.</h3>
      </div>
    );
  }

  const { populations, summaryStats, byCoClass } = data;

  // Print-specific Styling
  const printStyles = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #ffffff;
      color: #1a1a1a;
      margin: 0;
      padding: 10px;
      font-size: 11px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      color: #1e3a8a;
      font-weight: 700;
    }
    .header p {
      margin: 4px 0 0 0;
      color: #4b5563;
      font-size: 11px;
    }
    .meta-info {
      text-align: right;
      font-size: 10px;
      color: #6b7280;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card {
      border: 1px solid #e5e7eb;
      background-color: #f9fafb;
      border-radius: 6px;
      padding: 10px 12px;
      text-align: center;
    }
    .kpi-label {
      font-size: 9px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 16px;
      font-weight: 700;
      color: #1e3a8a;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .print-table th {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      color: #1e293b;
      padding: 8px 10px;
      font-weight: 600;
      text-align: left;
    }
    .print-table td {
      border: 1px solid #e5e7eb;
      padding: 7px 10px;
      color: #374151;
    }
    .print-table tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-high {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .badge-medium {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .badge-low {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .no-print {
        display: none;
      }
    }
  `;

  // Chart configuration parameters
  const legendStyle = {
    labels: {
      color: '#334155',
      font: { family: 'Segoe UI', size: 9 },
      boxWidth: 8,
      usePointStyle: true,
      pointStyle: 'circle'
    }
  };
  const gridStyle = { color: 'rgba(0,0,0,0.06)', borderColor: 'rgba(0,0,0,0.08)' };

  // Chart 1: Doughnut risk distribution
  const chartRiskDistData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [summaryStats.high, summaryStats.medium, summaryStats.low],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };

  const chartRiskDistOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    animation: false,
    plugins: {
      legend: { position: 'bottom', ...legendStyle }
    }
  };

  // Chart 2: Grouped Bar risk by class
  const coClassesList = Object.keys(byCoClass);
  const coHigh = coClassesList.map(c => byCoClass[c]?.High || 0);
  const coMedium = coClassesList.map(c => byCoClass[c]?.Medium || 0);
  const coLow = coClassesList.map(c => byCoClass[c]?.Low || 0);

  const chartRiskByCoData = {
    labels: coClassesList,
    datasets: [
      { label: 'High', data: coHigh, backgroundColor: '#ef4444', borderRadius: 2 },
      { label: 'Medium', data: coMedium, backgroundColor: '#f59e0b', borderRadius: 2 },
      { label: 'Low', data: coLow, backgroundColor: '#10b981', borderRadius: 2 }
    ]
  };

  const chartRiskByCoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'bottom', ...legendStyle }
    },
    scales: {
      x: { grid: gridStyle, ticks: { color: '#334155', font: { size: 9 } } },
      y: { grid: gridStyle, ticks: { color: '#334155', font: { size: 9 } }, beginAtZero: true }
    }
  };

  return (
    <div style={{ background: '#ffffff', color: '#111', padding: '10px' }}>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Header Block */}
      <div className="header">
        <div>
          <h1>LAPORAN ANALISIS RISIKO DEBITUR</h1>
          <p>Sistem Pemantauan dan Skoring Risiko Real-Time</p>
        </div>
        <div className="meta-info">
          <div>Digenerate: {new Date().toLocaleString('id-ID')}</div>
          <div>Filter: {period ? `Periode ${period}` : 'Semua Periode'} {coClass && `· CO ${coClass}`} {riskLevel && `· Risiko ${riskLevel}`}</div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Debitur</div>
          <div className="kpi-value">{summaryStats.filtered}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">High Risk</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{summaryStats.high}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Medium Risk</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{summaryStats.medium}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg. Risk Score</div>
          <div className="kpi-value">{summaryStats.avg_score}</div>
        </div>
      </div>

      {/* Printable charts section */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', background: '#fafafa', height: '180px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '10px', textTransform: 'uppercase', color: '#1e3a8a', textAlign: 'center', fontWeight: 700 }}>Distribusi Tingkat Risiko</h3>
          <div style={{ position: 'relative', flex: 1, height: '140px' }}>
            <Doughnut data={chartRiskDistData} options={chartRiskDistOptions} />
          </div>
        </div>
        <div style={{ flex: 1.5, border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', background: '#fafafa', height: '180px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '10px', textTransform: 'uppercase', color: '#1e3a8a', textAlign: 'center', fontWeight: 700 }}>Risiko per Kelas CO</h3>
          <div style={{ position: 'relative', flex: 1, height: '140px' }}>
            <Bar data={chartRiskByCoData} options={chartRiskByCoOptions} />
          </div>
        </div>
      </div>

      {/* Debtors List Table */}
      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '4%' }}>No.</th>
            <th style={{ width: '20%' }}>Nama Debitur</th>
            <th style={{ width: '8%' }}>Usia</th>
            <th style={{ width: '10%' }}>DTI %</th>
            <th style={{ width: '12%' }}>Delay</th>
            <th style={{ width: '10%' }}>Kredit</th>
            <th style={{ width: '10%' }}>Beban CO%</th>
            <th style={{ width: '10%' }}>Skor Risiko</th>
            <th style={{ width: '10%' }}>Tingkat Risiko</th>
            <th style={{ width: '10%' }}>Periode</th>
          </tr>
        </thead>
        <tbody>
          {populations.data.map((pop, i) => (
            <tr key={pop.id}>
              <td>{i + 1}</td>
              <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{pop.name}</td>
              <td>{pop.age} th</td>
              <td>{pop.dti}%</td>
              <td>{pop.payment_delay} hari</td>
              <td>{pop.credit_score}</td>
              <td>{pop.co_burden}%</td>
              <td style={{ fontWeight: 700 }}>{pop.risk_score.toFixed(2)}</td>
              <td>
                <span className={`badge badge-${pop.risk_level.toLowerCase()}`}>{pop.risk_level}</span>
              </td>
              <td>{pop.period}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LaporanPrint;
