import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Sliders, 
  Settings as SettingsIcon,
  Info 
} from 'lucide-react';
import api from '../services/api';

const Parameter = () => {
  const [parameters, setParameters] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchParameters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parameter');
      setParameters(res.data.parameters);
      setTotalWeight(res.data.totalWeight);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data parameter penilaian risiko.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const handleWeightChange = (key, value) => {
    const parsedVal = parseFloat(value) || 0;
    setParameters(prev => {
      const updated = prev.map(p => p.key === key ? { ...p, weight: parsedVal } : p);
      setTotalWeight(updated.reduce((sum, p) => sum + p.weight, 0));
      return updated;
    });
  };

  const handleCriteriaChange = (paramKey, ruleIndex, field, value) => {
    setParameters(prev => {
      return prev.map(p => {
        if (p.key !== paramKey) return p;
        
        const updatedCriteria = [...p.criteria];
        updatedCriteria[ruleIndex] = {
          ...updatedCriteria[ruleIndex],
          [field]: ['min', 'max', 'score'].includes(field) ? parseFloat(value) || 0 : value
        };
        return { ...p, criteria: updatedCriteria };
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Total bobot parameter harus tepat berjumlah 100%. Saat ini: ${totalWeight}%`);
      return;
    }

    setSaving(true);
    try {
      // Map weights and criteria to post format
      const weights = {};
      const criteria = {};
      parameters.forEach(p => {
        weights[p.key] = p.weight;
        criteria[p.key] = p.criteria;
      });

      const res = await api.post('/parameter', { weights, criteria });
      setSuccess(res.data.message);
      fetchParameters();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal menyimpan parameter penilaian.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-cyan-500" size={32} />
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Memuat parameter penilaian...</span>
      </div>
    );
  }

  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

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

      {/* Weight sum validation banner */}
      <div className="weight-summary" style={{ borderColor: isWeightValid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)', background: isWeightValid ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={20} className={isWeightValid ? 'text-emerald-500' : 'text-red-500'} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Total Bobot Parameter Penilaian</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Jumlah persentase seluruh bobot parameter harus sama dengan 100%.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'monospace', color: isWeightValid ? 'var(--color-low)' : 'var(--color-high)' }}>
            {totalWeight}%
          </span>
        </div>
      </div>

      {/* Main configuration form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {parameters.map((param) => (
            <div key={param.key} className="parameter-section">
              
              <div className="parameter-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="parameter-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{param.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({param.key})</span>
                </div>
                
                <div className="parameter-weight-box">
                  <span className="form-label" style={{ margin: 0 }}>Bobot:</span>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '80px', textAlign: 'center', padding: '6px' }}
                    value={param.weight}
                    onChange={(e) => handleWeightChange(param.key, e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    required
                  />
                  <span style={{ fontWeight: 600 }}>%</span>
                </div>
              </div>

              {/* Criteria ranges grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <span className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Kriteria Penilaian & Skor
                </span>
                
                {param.criteria && param.criteria.map((rule, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '10px' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Batas Bawah (Min)</span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: '6px' }}
                        value={rule.min}
                        onChange={(e) => handleCriteriaChange(param.key, idx, 'min', e.target.value)}
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Batas Atas (Max)</span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: '6px' }}
                        value={rule.max}
                        onChange={(e) => handleCriteriaChange(param.key, idx, 'max', e.target.value)}
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Skor Penilaian</span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: '6px' }}
                        value={rule.score}
                        onChange={(e) => handleCriteriaChange(param.key, idx, 'score', e.target.value)}
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Tingkat Kerawanan</span>
                      <select
                        className="form-control form-select"
                        style={{ padding: '6px', fontSize: '0.85rem' }}
                        value={rule.level}
                        onChange={(e) => handleCriteriaChange(param.key, idx, 'level', e.target.value)}
                      >
                        <option value="Low">Low (Aman)</option>
                        <option value="Medium">Medium (Sedang)</option>
                        <option value="High">High (Rawan)</option>
                      </select>
                    </div>
                    <div style={{ paddingSelf: 'flex-end', paddingTop: '16px' }}>
                      <span className={`badge badge-${rule.level.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                        {rule.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Submit bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving || !isWeightValid}
            style={{ padding: '12px 24px' }}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan & Hitung Ulang Debitur'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default Parameter;
