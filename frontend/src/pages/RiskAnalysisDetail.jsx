import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle,
  User,
  Calendar,
  Layers,
  FileText,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

const RiskAnalysisDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/risk-analysis/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat profil risiko debitur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data profil debitur...</span>
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
    population,
    breakdown,
    similar
  } = data;

  // Radar Chart datasets
  const radarLabels = breakdown.map(b => b.name);
  const radarScores = breakdown.map(b => b.score);

  const radarData = {
    labels: radarLabels,
    datasets: [{
      label: `Profil Skor ${population.name}`,
      data: radarScores,
      backgroundColor: 'rgba(0, 240, 255, 0.15)',
      borderColor: '#00f0ff',
      pointBackgroundColor: '#00f0ff',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#00f0ff',
      borderWidth: 2
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: { color: '#8e9bb4', font: { size: 10, family: 'Plus Jakarta Sans', weight: 600 } },
        ticks: { color: '#8e9bb4', backdropColor: 'transparent', stepSize: 20 },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back button link */}
      <div>
        <Link to="/risk-analysis" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px' }}>
          <ArrowLeft size={16} />
          Kembali ke Daftar
        </Link>
      </div>

      <div className="dashboard-grid">
        
        {/* Left col: Profile & Parameters details */}
        <div className="col-7" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Debtor Info card */}
          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' }}>
              {population.name.charAt(0).toUpperCase()}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{population.name}</h3>
                <span className={`badge badge-${population.risk_level.toLowerCase()}`}>{population.risk_level} Risk</span>
                <span className="badge badge-status">{population.status}</span>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} className="text-cyan-500" /> Usia {population.age} th
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} className="text-blue-500" /> Periode {population.period}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} className="text-purple-500" /> CO {population.co_class}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} className="text-muted" /> Pola {population.payment_pattern} / PS {population.ps_ambc}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Skor Risiko</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: population.risk_level === 'High' ? 'var(--color-high)' : population.risk_level === 'Medium' ? 'var(--color-medium)' : 'var(--color-low)' }}>
                {population.risk_score.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Parameter contributions list */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>
              Rincian Kontribusi Skor Parameter
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {breakdown.map((item) => (
                <div 
                  key={item.key} 
                  style={{ 
                    padding: '12px 16px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bobot: {item.weight}%</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Nilai Riil: <strong style={{ color: '#fff' }}>{item.value ?? 'N/A'}</strong> · Kriteria Terpenuhi: <em style={{ color: 'var(--color-cyan)' }}>{item.label}</em>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', textAlign: 'right' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Nilai Skor</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{item.score}</strong>
                    </div>
                    <div style={{ width: '80px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Kontribusi</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-cyan)' }}>+{item.contribution}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right col: Radar chart & Similar debtors */}
        <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Radar chart */}
          <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)', alignSelf: 'flex-start' }}>
              Visualisasi Profil Radar Risiko
            </h3>
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '260px' }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          {/* Similar debtors */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} className="text-cyan-500" />
              Debitur Selevel Risiko ({population.risk_level})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {similar.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                  Tidak ada debitur selevel lainnya.
                </div>
              ) : (
                similar.map(debtor => (
                  <Link
                    key={debtor.id}
                    to={`/risk-analysis/${debtor.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      transition: 'var(--transition-smooth)'
                    }}
                    className="similar-debtor-link"
                  >
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{debtor.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        CO {debtor.co_class} · Delay {debtor.payment_delay} hari
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem' }}>{debtor.risk_score.toFixed(1)}</strong>
                      <ChevronRight size={14} className="text-secondary" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default RiskAnalysisDetail;
