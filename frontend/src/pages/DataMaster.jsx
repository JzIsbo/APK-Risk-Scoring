import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function DataMaster() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states to add new options
  const [newCo, setNewCo] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newPs, setNewPs] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const loadMasterData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/data-master');
      setData(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data master.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleAddOption = async (e, type, value, setter, endpoint) => {
    e.preventDefault();
    if (!value.trim()) return;

    setSuccess('');
    setError('');

    try {
      const response = await api.post(`/data-master/${endpoint}`, { name: value });
      setSuccess(response.data.message);
      setter('');
      loadMasterData();
    } catch (err) {
      console.error(err);
      setError(`Gagal menambahkan ${type}.`);
    }
  };

  if (loading && !data) return <div className="loading-container">Memuat data master...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { coClasses, paymentPatterns, psAmbcClasses, statuses, coStats, patternStats, psStats, statusStats, periodStats } = data;

  return (
    <>
      {success && (
        <div className="alert alert-success" style={{ padding: '12px', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <i className="fa-solid fa-circle-check"></i> {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ padding: '12px', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <i className="fa-solid fa-circle-xmark"></i> {error}
        </div>
      )}

      {/* Grid for master tables */}
      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* CO Classes */}
        <div className="glass-card col-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Data Master: Kelas CO</h4>
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Nama Kelas</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>Total Debitur</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>High Risk</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Rata Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {coClasses.map(cls => {
                    const stats = coStats[cls] || { total: 0, high: 0, avg_score: 0 };
                    return (
                      <tr key={cls} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{cls}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{stats.total}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--color-high)' }}>{stats.high}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{stats.avg_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <form onSubmit={e => handleAddOption(e, 'Kelas CO', newCo, setNewCo, 'co-class')} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <input
              type="text"
              value={newCo}
              onChange={e => setNewCo(e.target.value)}
              placeholder="Tambah kelas CO baru..."
              style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>Tambah</button>
          </form>
        </div>

        {/* Payment Patterns */}
        <div className="glass-card col-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Data Master: Pola Bayar</h4>
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Nama Pola</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>Total Debitur</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>High Risk</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Avg Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentPatterns.map(pat => {
                    const stats = patternStats[pat] || { total: 0, high_risk: 0, avg_delay: 0 };
                    return (
                      <tr key={pat} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{pat}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{stats.total}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--color-high)' }}>{stats.high_risk}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>{stats.avg_delay} Hari</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <form onSubmit={e => handleAddOption(e, 'Pola Bayar', newPattern, setNewPattern, 'payment-pattern')} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <input
              type="text"
              value={newPattern}
              onChange={e => setNewPattern(e.target.value)}
              placeholder="Tambah pola bayar baru..."
              style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>Tambah</button>
          </form>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '1.5rem' }}>
        {/* PS AMBC Classes */}
        <div className="glass-card col-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Data Master: PS AMBC</h4>
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Nama Kelas</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>Total Debitur</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>High Risk</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Rata Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {psAmbcClasses.map(ps => {
                    const stats = psStats[ps] || { total: 0, high: 0, avg_score: 0 };
                    return (
                      <tr key={ps} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{ps}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{stats.total}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--color-high)' }}>{stats.high}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{stats.avg_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <form onSubmit={e => handleAddOption(e, 'PS AMBC', newPs, setNewPs, 'ps-ambc')} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <input
              type="text"
              value={newPs}
              onChange={e => setNewPs(e.target.value)}
              placeholder="Tambah PS AMBC baru..."
              style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>Tambah</button>
          </form>
        </div>

        {/* Statuses */}
        <div className="glass-card col-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Data Master: Status</h4>
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>Nama Status</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>Total Debitur</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>High Risk</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Rata Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.map(st => {
                    const stats = statusStats[st] || { total: 0, high: 0, avg_score: 0 };
                    return (
                      <tr key={st} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{st}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{stats.total}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--color-high)' }}>{stats.high}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{stats.avg_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <form onSubmit={e => handleAddOption(e, 'Status', newStatus, setNewStatus, 'status')} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <input
              type="text"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              placeholder="Tambah status baru..."
              style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>Tambah</button>
          </form>
        </div>
      </div>

      {/* MoM Period Logs */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daftar Periode Tercatat & Statistik Analisis</h4>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '12px 20px' }}>Periode Bulan</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Total Debitur Terdaftar</th>
                <th style={{ padding: '12px 20px', textAlign: 'center' }}>Jumlah Debitur High Risk</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Rata-rata Skor Risiko Periode</th>
              </tr>
            </thead>
            <tbody>
              {periodStats.map(p => (
                <tr key={p.period} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>{p.period}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>{p.total}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-high)', fontWeight: 'bold' }}>{p.high_count}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{parseFloat(p.avg_score).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
