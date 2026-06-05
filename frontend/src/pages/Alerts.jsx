import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  CheckCheck, 
  Radiation,
  Clock, 
  Percent, 
  Ban, 
  ShieldAlert, 
  RefreshCw,
  BellRing
} from 'lucide-react';
import api from '../services/api';

const Alerts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, critical, warning, info

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data alert portofolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/alerts/${id}/mark-read`);
      // Update local state to mark read instantly
      setData(prev => {
        const updatedAlerts = prev.alerts.map(a => a.id === id ? { ...a, read: true } : a);
        return {
          ...prev,
          alerts: updatedAlerts,
          critical: updatedAlerts.filter(a => a.severity === 'critical'),
          warning: updatedAlerts.filter(a => a.severity === 'warning'),
          info: updatedAlerts.filter(a => a.severity === 'info'),
        };
      });
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/alerts/mark-all-read');
      setData(prev => {
        const updatedAlerts = prev.alerts.map(a => ({ ...a, read: true }));
        return {
          ...prev,
          alerts: updatedAlerts,
          critical: updatedAlerts.filter(a => a.severity === 'critical'),
          warning: updatedAlerts.filter(a => a.severity === 'warning'),
          info: updatedAlerts.filter(a => a.severity === 'info'),
        };
      });
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat data alert...</span>
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
    alerts,
    critical,
    warning,
    info,
    highRiskDebtors,
    severeDelay,
    highDti,
    stats
  } = data;

  const getFilteredAlerts = () => {
    if (activeTab === 'critical') return critical;
    if (activeTab === 'warning') return warning;
    if (activeTab === 'info') return info;
    return alerts;
  };

  const filteredAlerts = getFilteredAlerts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Alert Stats row */}
      <section className="metrics-grid">
        
        {/* Critical alert stats */}
        <div className="glass-card metric-card card-high-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-high)' }}>
            <Radiation size={20} />
          </div>
          <div>
            <span className="metric-label">Alert Kritis</span>
            <div className="metric-value-container">
              <span className="metric-value">{critical.filter(a => !a.read).length}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Belum Dibaca (MoM & Delay)
          </span>
        </div>

        {/* Warning alert stats */}
        <div className="glass-card metric-card card-populasi-risk">
          <div className="metric-icon-box" style={{ color: 'var(--color-medium)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="metric-label">Alert Peringatan</span>
            <div className="metric-value-container">
              <span className="metric-value">{warning.filter(a => !a.read).length}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Belum Dibaca (DTI & No Order)
          </span>
        </div>

        {/* Severe delay count stats */}
        <div className="glass-card metric-card card-no-order">
          <div className="metric-icon-box" style={{ color: 'var(--color-purple)' }}>
            <Clock size={20} />
          </div>
          <div>
            <span className="metric-label">Delay &gt; 90 Hari</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.totalDelay90}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Debitur Keterlambatan Parah
          </span>
        </div>

        {/* DTI > 70% stats */}
        <div className="glass-card metric-card card-total-populasi">
          <div className="metric-icon-box" style={{ color: 'var(--color-cyan)' }}>
            <Percent size={20} />
          </div>
          <div>
            <span className="metric-label">DTI &gt; 70%</span>
            <div className="metric-value-container">
              <span className="metric-value">{stats.totalHighDti}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Rasio Utang Sangat Tinggi
          </span>
        </div>

      </section>

      {/* Main Grid: Left feed list, Right warning debtor sub-grids */}
      <div className="dashboard-grid">
        
        {/* Left col: Alert logs list */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              
              {/* Tab Filters */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setActiveTab('all')}
                >
                  Semua ({alerts.length})
                </button>
                <button 
                  className={`btn ${activeTab === 'critical' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ color: activeTab === 'critical' ? '#fff' : 'var(--color-high)' }}
                  onClick={() => setActiveTab('critical')}
                >
                  Kritis ({critical.length})
                </button>
                <button 
                  className={`btn ${activeTab === 'warning' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ color: activeTab === 'warning' ? '#fff' : 'var(--color-medium)' }}
                  onClick={() => setActiveTab('warning')}
                >
                  Peringatan ({warning.length})
                </button>
                <button 
                  className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ color: activeTab === 'info' ? '#fff' : 'var(--color-cyan)' }}
                  onClick={() => setActiveTab('info')}
                >
                  Info ({info.length})
                </button>
              </div>

              {/* Mark all read button */}
              {alerts.some(a => !a.read) && (
                <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
                  <CheckCheck size={14} />
                  Tandai Semua Terbaca
                </button>
              )}

            </div>

            {/* Logs feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <BellRing size={32} />
                  <span>Tidak ada alert kategori ini.</span>
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  let alertBorder = 'var(--border-color)';
                  let alertBg = 'rgba(255, 255, 255, 0.01)';
                  let alertColor = 'var(--text-secondary)';

                  if (alert.severity === 'critical') {
                    alertBorder = 'rgba(239, 68, 68, 0.25)';
                    alertBg = 'rgba(239, 68, 68, 0.03)';
                    alertColor = 'var(--color-high)';
                  } else if (alert.severity === 'warning') {
                    alertBorder = 'rgba(245, 158, 17, 0.25)';
                    alertBg = 'rgba(245, 158, 17, 0.03)';
                    alertColor = 'var(--color-medium)';
                  } else if (alert.severity === 'info') {
                    alertBorder = 'rgba(0, 210, 255, 0.25)';
                    alertBg = 'rgba(0, 210, 255, 0.03)';
                    alertColor = 'var(--color-cyan)';
                  }

                  if (alert.read) {
                    alertBg = 'rgba(255,255,255,0.005)';
                    alertBorder = 'var(--border-color)';
                  }

                  return (
                    <div 
                      key={alert.id}
                      style={{
                        padding: '16px',
                        background: alertBg,
                        border: `1px solid ${alertBorder}`,
                        borderRadius: '14px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                        transition: 'var(--transition-smooth)',
                        opacity: alert.read ? 0.65 : 1
                      }}
                    >
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border-color)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: alertColor,
                        flexShrink: 0
                      }}>
                        {alert.severity === 'critical' ? <AlertCircle size={18} /> : alert.severity === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: alert.read ? 'var(--text-primary)' : '#fff' }}>
                            {alert.title}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                          {alert.message}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'center' }}>
                          <Link to={alert.action_path} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}>
                            {alert.action_label}
                          </Link>
                          
                          {!alert.read && (
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => handleMarkRead(alert.id)}
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}
                            >
                              <Check size={12} style={{ marginRight: '4px' }} />
                              Tandai Terbaca
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* Right col: Watchlist lists */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Severe delay watchlist */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} className="text-pink-500" />
              Watchlist Keterlambatan &gt; 90 Hari
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {severeDelay.slice(0, 5).map(pop => (
                <Link 
                  key={pop.id} 
                  to={`/risk-analysis/${pop.id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <span style={{ fontWeight: 600 }}>{pop.name}</span>
                  <span style={{ color: 'var(--color-high)', fontWeight: 700 }}>{pop.payment_delay} hari</span>
                </Link>
              ))}
            </div>
          </div>

          {/* High DTI watchlist */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={16} className="text-cyan-500" />
              Watchlist Rasio Utang DTI &gt; 70%
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {highDti.slice(0, 5).map(pop => (
                <Link 
                  key={pop.id} 
                  to={`/risk-analysis/${pop.id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <span style={{ fontWeight: 600 }}>{pop.name}</span>
                  <span style={{ color: 'var(--color-medium)', fontWeight: 700 }}>{pop.dti}%</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Critical high risk watchlist */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} className="text-red-500" />
              Top Debitur Risiko Tinggi
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {highRiskDebtors.slice(0, 5).map(pop => (
                <Link 
                  key={pop.id} 
                  to={`/risk-analysis/${pop.id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <span style={{ fontWeight: 600 }}>{pop.name}</span>
                  <span style={{ color: 'var(--color-high)', fontWeight: 800 }}>{pop.risk_score.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Alerts;
