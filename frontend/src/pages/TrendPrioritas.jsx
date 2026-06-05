import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus 
} from 'lucide-react';
import api from '../services/api';

const TrendPrioritas = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const res = await api.get('/trend-prioritas');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data tren prioritas.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrendData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data tren prioritas...</span>
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
    trendPrioritas,
    trendRisk,
    avgRiskScore,
    avgDtiByClass,
    coBreakdown,
    growthData
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

  // 1. Volume CO Class Trend (Line)
  const lineVolumeData = {
    labels: periodLabels,
    datasets: Object.keys(trendPrioritas).map((c, i) => ({
      label: c,
      data: trendPrioritas[c],
      borderColor: colors[i % colors.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2
    }))
  };

  // 2. Risk Level Trend (Line)
  const lineRiskData = {
    labels: periodLabels,
    datasets: [
      { label: 'High', data: trendRisk['High'], borderColor: '#ef4444', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2 },
      { label: 'Medium', data: trendRisk['Medium'], borderColor: '#f59e0b', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2 },
      { label: 'Low', data: trendRisk['Low'], borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2 }
    ]
  };

  // 3. Avg Risk Score (Bar)
  const barAvgScoreData = {
    labels: periodLabels,
    datasets: [{
      label: 'Rata-rata Skor Risiko',
      data: avgRiskScore,
      backgroundColor: 'rgba(0, 114, 255, 0.25)',
      borderColor: '#0072ff',
      borderWidth: 1.5,
      borderRadius: 4
    }]
  };

  // 4. Avg DTI per Class (Line)
  const lineDtiData = {
    labels: periodLabels,
    datasets: Object.keys(avgDtiByClass).map((c, i) => ({
      label: c,
      data: avgDtiByClass[c],
      borderColor: colors[i % colors.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2
    }))
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
      
      {/* MoM Growth Widgets */}
      <section className="metrics-grid">
        {Object.keys(growthData || {}).map((c, i) => {
          const statsObj = growthData[c];
          const isUp = statsObj.diff > 0;
          const isDown = statsObj.diff < 0;
          let growColor = 'var(--text-muted)';
          if (isUp) growColor = 'var(--color-high)'; // Wait: in priority MoM, does debtor increase mean good or bad? Usually debtor count up means more load/risk.
          if (isDown) growColor = 'var(--color-low)';

          return (
            <div key={c} className="glass-card metric-card">
              <div>
                <span className="metric-label">Pertumbuhan MoM: {c}</span>
                <div className="metric-value-container">
                  <span className="metric-value">{statsObj.curr}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', color: growColor }}>
                    {isUp ? <ArrowUpRight size={14} /> : isDown ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                    {statsObj.pct}% ({statsObj.diff > 0 ? `+${statsObj.diff}` : statsObj.diff})
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Periode Terakhir vs Sebelumnya
              </span>
            </div>
          );
        })}
      </section>

      {/* Charts Layout Grid */}
      <div className="dashboard-grid">
        
        {/* Trend Volume CO */}
        <div className="col-6 glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Tren Volume per Kelas CO
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={lineVolumeData} options={chartOptions} />
          </div>
        </div>

        {/* Trend Risk Levels */}
        <div className="col-6 glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Tren Tingkat Risiko Debitur
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={lineRiskData} options={chartOptions} />
          </div>
        </div>

        {/* Trend Average Score */}
        <div className="col-6 glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Tren Rata-rata Skor Risiko
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={barAvgScoreData} options={chartOptions} />
          </div>
        </div>

        {/* Trend Avg DTI */}
        <div className="col-6 glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Tren DTI Rata-rata per Kelas CO
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={lineDtiData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* Cohort statistics table */}
      <section className="glass-card" style={{ padding: '0 0 1.5rem 0', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, padding: '1.5rem 1.5rem 1rem 1.5rem', fontFamily: 'var(--font-display)' }}>
          Matriks Ringkasan Statistik per Kelas CO
        </h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Kelas CO</th>
                <th>Total Debitur</th>
                <th style={{ color: 'var(--color-high)' }}>High Risk</th>
                <th style={{ color: 'var(--color-medium)' }}>Medium Risk</th>
                <th style={{ color: 'var(--color-low)' }}>Low Risk</th>
                <th>Avg. Skor Risiko</th>
                <th>Avg. DTI (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(coBreakdown).map(classKey => {
                const stats = coBreakdown[classKey];
                return (
                  <tr key={classKey}>
                    <td style={{ fontWeight: 700 }}>{classKey}</td>
                    <td style={{ fontWeight: 600 }}>{stats.total}</td>
                    <td style={{ color: 'var(--color-high)', fontWeight: 600 }}>{stats.high}</td>
                    <td style={{ color: 'var(--color-medium)', fontWeight: 600 }}>{stats.medium}</td>
                    <td style={{ color: 'var(--color-low)', fontWeight: 600 }}>{stats.low}</td>
                    <td style={{ fontWeight: 700 }}>{stats.avg_score.toFixed(2)}</td>
                    <td>{stats.avg_dti.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default TrendPrioritas;
