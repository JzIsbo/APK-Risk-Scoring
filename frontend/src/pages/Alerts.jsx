import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Alerts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts');
      setData(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat alert notifikasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/alerts/${id}/mark-read`);
      // Update local state to set read = true
      setData(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => a.id === id ? { ...a, read: true } : a),
        critical: prev.critical.map(a => a.id === id ? { ...a, read: true } : a),
        warning: prev.warning.map(a => a.id === id ? { ...a, read: true } : a),
        info: prev.info.map(a => a.id === id ? { ...a, read: true } : a)
      }));
      setSuccess(`Notifikasi berhasil ditandai sebagai terbaca.`);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui status notifikasi.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await api.post('/alerts/mark-all-read');
      setSuccess(response.data.message);
      // Set all read = true
      setData(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => ({ ...a, read: true })),
        critical: prev.critical.map(a => ({ ...a, read: true })),
        warning: prev.warning.map(a => ({ ...a, read: true })),
        info: prev.info.map(a => ({ ...a, read: true }))
      }));
    } catch (err) {
      console.error(err);
      setError('Gagal menandai semua notifikasi.');
    }
  };

  if (loading && !data) return <div className="loading-container">Memuat notifikasi...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { alerts, critical, warning, info, highRiskDebtors, severeDelay, highDti, stats } = data;
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <>
      {/* Alert Stats row */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--color-high)' }}>
          <div>
            <span className="metric-label" style={{ color: 'var(--color-high)', fontWeight: 'bold' }}>Kategori Kritis (Critical)</span>
            <div className="metric-value-container" style={{ marginTop: '8px' }}>
              <span className="metric-value" style={{ fontSize: '1.6rem' }}>{stats.totalHigh}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Debitur High Risk</span>
            </div>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--color-medium)' }}>
          <div>
            <span className="metric-label" style={{ color: 'var(--color-medium)', fontWeight: 'bold' }}>Peringatan Keterlambatan</span>
            <div className="metric-value-container" style={{ marginTop: '8px' }}>
              <span className="metric-value" style={{ fontSize: '1.6rem' }}>{stats.totalDelay90}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Debitur &gt; 90 Hari</span>
            </div>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--color-blue)' }}>
          <div>
            <span className="metric-label" style={{ color: 'var(--color-blue)', fontWeight: 'bold' }}>Rasio Utang Tinggi</span>
            <div className="metric-value-container" style={{ marginTop: '8px' }}>
              <span className="metric-value" style={{ fontSize: '1.6rem' }}>{stats.totalHighDti}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Debitur DTI &gt; 70%</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--text-secondary)' }}>
          <div>
            <span className="metric-label" style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Pemberitahuan Belum Terbaca</span>
            <div className="metric-value-container" style={{ marginTop: '8px' }}>
              <span className="metric-value" style={{ fontSize: '1.6rem' }}>{unreadCount}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Pesan Baru</span>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success" style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <i className="fa-solid fa-circle-check"></i> {success}
        </div>
      )}

      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* Left Column: Notification list */}
        <div className="glass-card col-7">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daftar Peringatan Sistem</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Tandai Semua Terbaca
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada alert yang terdaftar.</div>
            ) : (
              alerts.map(a => {
                const borderL = a.severity === 'critical' 
                  ? '4px solid var(--color-high)' 
                  : a.severity === 'warning' 
                    ? '4px solid var(--color-medium)' 
                    : '4px solid var(--color-cyan)';
                return (
                  <div key={a.id} style={{ display: 'flex', gap: '14px', padding: '14px 16px', background: a.read ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderLeft: borderL, borderRadius: '12px', opacity: a.read ? 0.75 : 1, transition: 'var(--transition-smooth)' }}>
                    <div style={{ fontSize: '1.25rem', color: a.severity === 'critical' ? 'var(--color-high)' : a.severity === 'warning' ? 'var(--color-medium)' : 'var(--color-cyan)', marginTop: '2px' }}>
                      <i className={`fa-solid ${a.icon}`}></i>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{a.title}</h5>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.time}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{a.message}</p>
                      
                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', alignItems: 'center' }}>
                        {!a.read && (
                          <button onClick={() => handleMarkRead(a.id)} style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                            Tandai Terbaca
                          </button>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {a.read ? 'Terbaca' : 'Baru'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Key debtors checklist */}
        <div className="glass-card col-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Debitur Perlu Perhatian Segera</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {highRiskDebtors.slice(0, 5).map(deb => (
                <div key={deb.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600 }}>{deb.name}</span>
                  <strong style={{ color: 'var(--color-high)' }}>{deb.risk_score.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Tunggakan &gt; 90 Hari (Eskalasi)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {severeDelay.slice(0, 5).map(deb => (
                <div key={deb.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600 }}>{deb.name}</span>
                  <strong style={{ color: 'var(--color-medium)' }}>{deb.payment_delay} Hari</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Rasio Utang &gt; 70% (DTI Tinggi)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {highDti.slice(0, 5).map(deb => (
                <div key={deb.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600 }}>{deb.name}</span>
                  <strong style={{ color: 'var(--color-blue)' }}>{deb.dti}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
