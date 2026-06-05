import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Settings() {
  const [lowThreshold, setLowThreshold] = useState(40);
  const [mediumThreshold, setMediumThreshold] = useState(70);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setLowThreshold(response.data.risk_low_threshold);
      setMediumThreshold(response.data.risk_medium_threshold);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat pengaturan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const low = parseFloat(lowThreshold);
    const med = parseFloat(mediumThreshold);

    if (low >= med) {
      setError('Batas bawah (Low Risk) harus lebih kecil daripada batas atas (Medium Risk).');
      return;
    }

    try {
      const response = await api.post('/settings', {
        risk_low_threshold: low,
        risk_medium_threshold: med
      });
      setSuccess(response.data.message);
      loadSettings();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal memperbarui ambang batas sistem.');
      }
    }
  };

  if (loading) return <div className="loading-container">Memuat pengaturan...</div>;
  if (error && !lowThreshold) return <div className="alert alert-danger">{error}</div>;

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

      <div className="glass-card" style={{ maxWidth: '600px', padding: '28px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>
          <i className="fa-solid fa-sliders" style={{ color: 'var(--color-cyan)', marginRight: '6px' }}></i> Klasifikasi Ambang Batas Risiko
        </h4>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5', marginBottom: '24px' }}>
          Tentukan ambang batas nilai untuk menentukan pengelompokan tingkat risiko debitur secara global. Perubahan ambang batas ini akan memicu kalkulasi ulang tingkat risiko (Low, Medium, High) untuk seluruh data debitur yang terdaftar di dalam database secara otomatis.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Batas Atas Low Risk (Skor Maksimum)</label>
              <input
                required
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={lowThreshold}
                onChange={e => setLowThreshold(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }}
              />
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Skor 0 s/d batas ini dikategorikan Low Risk</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Batas Bawah High Risk (Skor Minimum)</label>
              <input
                required
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={mediumThreshold}
                onChange={e => setMediumThreshold(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }}
              />
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Skor di atas batas ini dikategorikan High Risk</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <strong>Skema Pengelompokan:</strong>
            <ul style={{ marginLeft: '16px', marginTop: '6px', listStyleType: 'disc' }}>
              <li style={{ color: 'var(--color-low)' }}>Skor 0 s/d {parseFloat(lowThreshold) || 0} &rarr; Low Risk (Aman)</li>
              <li style={{ color: 'var(--color-medium)' }}>Skor {parseFloat(lowThreshold) || 0} s/d {parseFloat(mediumThreshold) || 0} &rarr; Medium Risk (Waspada)</li>
              <li style={{ color: 'var(--color-high)' }}>Skor {parseFloat(mediumThreshold) || 0} ke atas &rarr; High Risk (Kritis)</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', color: '#050b1a', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 240, 255, 0.15)' }}>
              <i className="fa-solid fa-save" style={{ marginRight: '6px' }}></i> Simpan & Kalkulasi Ulang
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
