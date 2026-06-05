import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const [lowThreshold, setLowThreshold] = useState(40);
  const [mediumThreshold, setMediumThreshold] = useState(70);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      setLowThreshold(res.data.risk_low_threshold);
      setMediumThreshold(res.data.risk_medium_threshold);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat pengaturan batas ambang risiko.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const low = parseFloat(lowThreshold);
    const med = parseFloat(mediumThreshold);

    if (low >= med) {
      setError('Ambang batas bawah (Low Risk) harus lebih kecil daripada ambang batas atas (Medium Risk).');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/settings', {
        risk_low_threshold: low,
        risk_medium_threshold: med
      });
      setSuccess(res.data.message);
      fetchSettings();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal memperbarui pengaturan sistem.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat pengaturan sistem...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-grid">
        
        {/* Settings configuration form */}
        <div className="col-8">
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingsIcon size={18} className="text-cyan-500" />
              Parameter Ambang Batas Klasifikasi Risiko
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
              Sesuaikan ambang batas skor di bawah ini untuk menentukan pengelompokan tingkat risiko debitur secara global. 
              Mengubah nilai ini akan memicu penghitungan ulang otomatis untuk seluruh tingkat risiko debitur di database.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Low Threshold input */}
              <div className="form-group">
                <label className="form-label" htmlFor="lowThreshold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Batas Atas Kategori Low Risk (Aman)
                </label>
                <input
                  type="number"
                  id="lowThreshold"
                  className="form-control"
                  style={{ marginTop: '6px' }}
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Debitur dengan skor di bawah nilai ini dikelompokkan sebagai <strong>Low Risk</strong>.
                </span>
              </div>

              {/* Medium Threshold input */}
              <div className="form-group">
                <label className="form-label" htmlFor="mediumThreshold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={16} className="text-amber-500" />
                  Batas Atas Kategori Medium Risk (Sedang)
                </label>
                <input
                  type="number"
                  id="mediumThreshold"
                  className="form-control"
                  style={{ marginTop: '6px' }}
                  value={mediumThreshold}
                  onChange={(e) => setMediumThreshold(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Debitur dengan skor di atas nilai ini dikelompokkan sebagai <strong>High Risk</strong>.
                </span>
              </div>

            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                style={{ padding: '12px 24px' }}
              >
                {saving ? 'Menyimpan...' : 'Perbarui & Hitung Ulang Risiko'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Info Box */}
        <div className="col-4 glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={16} className="text-cyan-500" />
            Panduan Klasifikasi
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            <div>
              <span className="badge badge-low" style={{ marginBottom: '6px', fontSize: '0.65rem' }}>Low Risk (Aman)</span>
              <p>Rentang skor risiko: <strong>0 s.d &lt; {lowThreshold}</strong></p>
            </div>
            
            <div>
              <span className="badge badge-medium" style={{ marginBottom: '6px', fontSize: '0.65rem' }}>Medium Risk (Perlu Pantau)</span>
              <p>Rentang skor risiko: <strong>{lowThreshold} s.d &lt; {mediumThreshold}</strong></p>
            </div>

            <div>
              <span className="badge badge-high" style={{ marginBottom: '6px', fontSize: '0.65rem' }}>High Risk (Bahaya / Kritis)</span>
              <p>Rentang skor risiko: <strong>{mediumThreshold} s.d 100</strong></p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
              <p style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Catatan: Batas atas kategori Medium Risk juga bertindak secara otomatis sebagai batas bawah kategori High Risk.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
