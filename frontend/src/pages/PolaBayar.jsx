import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  AlertTriangle, 
  RefreshCw, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  Percent 
} from 'lucide-react';
import api from '../services/api';

const PolaBayar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolaData = async () => {
      try {
        const res = await api.get('/pola-bayar');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data pola bayar.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolaData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data tren pola bayar...</span>
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
    periodLabels,
    polaBayarData,
    psAmbcData,
    avgDelayPerPeriod,
    patternSummary,
    psAmbcSummary,
    noOrderByPattern,
    crossTab
  } = data;

  const colors = ['#00d2ff', '#0072ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
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

  // 1. Pola Bayar Trend (Line)
  const linePolaData = {
    labels: periodLabels,
    datasets: Object.keys(polaBayarData).map((p, i) => ({
      label: p,
      data: polaBayarData[p],
      borderColor: colors[i % colors.length],
      backgroundColor: 'transparent',
      tension: 0.3,
      borderWidth: 2
    }))
  };

  // 2. PS AMBC Trend (Line)
  const linePsData = {
    labels: periodLabels,
    datasets: Object.keys(psAmbcData).map((p, i) => ({
      label: p,
      data: psAmbcData[p],
      borderColor: colors[(i + 3) % colors.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2
    }))
  };

  // 3. Avg Delay (Line with Fill)
  const lineDelayData = {
    labels: periodLabels,
    datasets: [{
      label: 'Rata-rata Keterlambatan (Hari)',
      data: avgDelayPerPeriod,
      borderColor: '#ec4899',
      backgroundColor: 'rgba(236, 72, 153, 0.05)',
      fill: true,
      tension: 0.3,
      borderWidth: 2
    }]
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
      
      {/* Charts row */}
      <div className="dashboard-grid">
        {/* Tren Pola Bayar Akhir */}
        <div className="col-6 glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} className="text-cyan-500" />
            Tren Pola Bayar Akhir (L3, L4, L5)
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={linePolaData} options={chartOptions} />
          </div>
        </div>

        {/* Tren PS AMBC */}
        <div className="col-6 glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} className="text-blue-500" />
            Tren Kategori PS AMBC
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={linePsData} options={chartOptions} />
          </div>
        </div>

        {/* Tren Average Delay */}
        <div className="col-12 glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} className="text-purple-500" />
            Tren Rata-rata Keterlambatan Pembayaran (Hari)
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={lineDelayData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Analysis grids */}
      <div className="dashboard-grid">
        
        {/* Pattern Summary */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '1.25rem 1.25rem 0.75rem 1.25rem', fontFamily: 'var(--font-display)' }}>
            Distribusi & Statistik Pola Bayar
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pola</th>
                  <th>Total</th>
                  <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                  <th>Avg. Skor</th>
                  <th>Avg. Delay</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(patternSummary).map(patKey => {
                  const stats = patternSummary[patKey];
                  return (
                    <tr key={patKey}>
                      <td style={{ fontWeight: 700 }}>{patKey}</td>
                      <td>{stats.total}</td>
                      <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{stats.high_risk}</td>
                      <td style={{ fontWeight: 700 }}>{stats.avg_score.toFixed(2)}</td>
                      <td>{stats.avg_delay.toFixed(1)} hari</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PS AMBC Summary */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '1.25rem 1.25rem 0.75rem 1.25rem', fontFamily: 'var(--font-display)' }}>
            Distribusi & Statistik PS AMBC
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kelas PS</th>
                  <th>Total</th>
                  <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                  <th>Avg. Skor Risiko</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(psAmbcSummary).map(psKey => {
                  const stats = psAmbcSummary[psKey];
                  return (
                    <tr key={psKey}>
                      <td style={{ fontWeight: 700 }}>{psKey}</td>
                      <td>{stats.total}</td>
                      <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{stats.high_risk}</td>
                      <td style={{ fontWeight: 700 }}>{stats.avg_score.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* No Order vs Active by Pattern & Cross tab matrix */}
      <div className="dashboard-grid">
        
        {/* Status Breakdown by pattern */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '1.25rem 1.25rem 0.75rem 1.25rem', fontFamily: 'var(--font-display)' }}>
            Status Portofolio per Pola Bayar
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pola</th>
                  <th>No Order (Non-Aktif)</th>
                  <th>Active</th>
                  <th>Settled (Lunas)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(noOrderByPattern).map(patKey => {
                  const stats = noOrderByPattern[patKey];
                  return (
                    <tr key={patKey}>
                      <td style={{ fontWeight: 700 }}>{patKey}</td>
                      <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{stats.no_order}</td>
                      <td style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{stats.active}</td>
                      <td style={{ color: 'var(--color-low)', fontWeight: 600 }}>{stats.settled}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cross tab pattern x ps_ambc */}
        <div className="col-6 glass-card" style={{ padding: '0 0 1.25rem 0', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '1.25rem 1.25rem 0.75rem 1.25rem', fontFamily: 'var(--font-display)' }}>
            Matriks Cross-Tabulation: Pola Bayar vs PS AMBC
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pola \ PS</th>
                  <th>PS-1</th>
                  <th>PS-2</th>
                  <th>PS-3</th>
                  <th>PS-4</th>
                </tr>
              </thead>
              <tbody>
                {['L3', 'L4', 'L5'].map(pat => (
                  <tr key={pat}>
                    <td style={{ fontWeight: 700 }}>{pat}</td>
                    <td style={{ fontWeight: 600 }}>{crossTab[pat]?.['PS-1'] || 0}</td>
                    <td style={{ fontWeight: 600 }}>{crossTab[pat]?.['PS-2'] || 0}</td>
                    <td style={{ fontWeight: 600 }}>{crossTab[pat]?.['PS-3'] || 0}</td>
                    <td style={{ fontWeight: 600 }}>{crossTab[pat]?.['PS-4'] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PolaBayar;
