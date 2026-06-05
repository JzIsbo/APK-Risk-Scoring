import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Parameter() {
  const [params, setParams] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state copies
  const [weights, setWeights] = useState({});
  const [criteria, setCriteria] = useState({});

  const loadParameters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parameter');
      const parameters = response.data.parameters;
      setParams(parameters);
      setTotalWeight(response.data.totalWeight);

      // Initialize form values
      const wMap = {};
      const cMap = {};
      parameters.forEach(p => {
        wMap[p.key] = p.weight;
        cMap[p.key] = JSON.parse(JSON.stringify(p.criteria || [])); // Deep clone
      });
      setWeights(wMap);
      setCriteria(cMap);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data parameter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParameters();
  }, []);

  // Update total weight indicator dynamically
  const handleWeightChange = (key, val) => {
    const newVal = parseFloat(val) || 0;
    const newWeights = { ...weights, [key]: newVal };
    setWeights(newWeights);

    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    setTotalWeight(sum);
  };

  // Update specific criteria min/max/score
  const handleCriteriaChange = (paramKey, index, field, value) => {
    const newCriteria = { ...criteria };
    const rule = newCriteria[paramKey][index];
    
    if (field === 'level') {
      rule[field] = value;
    } else {
      rule[field] = parseFloat(value) || 0;
    }

    setCriteria(newCriteria);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    // Weight sum validation
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Total bobot parameter harus tepat berjumlah 100%. Saat ini: ${totalWeight.toFixed(2)}%`);
      return;
    }

    try {
      const response = await api.post('/parameter', {
        weights,
        criteria
      });
      setSuccess(response.data.message);
      loadParameters();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal memperbarui parameter.');
      }
    }
  };

  if (loading && params.length === 0) return <div className="loading-container">Memuat parameter...</div>;
  if (error && params.length === 0) return <div className="alert alert-danger">{error}</div>;

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

      <div className="glass-card" style={{ marginBottom: '1.5rem', borderLeft: totalWeight === 100 ? '4px solid var(--color-low)' : '4px solid var(--color-high)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Akumulasi Bobot</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>Total bobot dari semua parameter penentu risiko wajib berjumlah tepat 100%.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: totalWeight === 100 ? 'var(--color-low)' : 'var(--color-high)', fontFamily: 'var(--font-display)' }}>
              {totalWeight.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '1.5rem' }}>
          {params.map(p => {
            const rules = criteria[p.key] || [];
            return (
              <div key={p.id} className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{p.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Database Key: {p.key}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bobot (%):</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={weights[p.key] || 0}
                      onChange={e => handleWeightChange(p.key, e.target.value)}
                      style={{ width: '80px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontWeight: 700, textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Criteria settings grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Batas Aturan Skor & Tingkat Risiko</label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {rules.map((rule, index) => {
                      const riskLvlColors = rule.level === 'High' 
                        ? 'var(--color-high)' 
                        : rule.level === 'Medium' 
                          ? 'var(--color-medium)' 
                          : 'var(--color-low)';
                      return (
                        <div key={index} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px' }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: riskLvlColors, textTransform: 'uppercase', marginBottom: '8px' }}>
                            {rule.level} Risk
                          </span>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min Value:</span>
                              <input
                                required
                                type="number"
                                step="any"
                                value={rule.min}
                                onChange={e => handleCriteriaChange(p.key, index, 'min', e.target.value)}
                                style={{ width: '80px', padding: '4px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Value:</span>
                              <input
                                required
                                type="number"
                                step="any"
                                value={rule.max}
                                onChange={e => handleCriteriaChange(p.key, index, 'max', e.target.value)}
                                style={{ width: '80px', padding: '4px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score (1-3):</span>
                              <input
                                required
                                type="number"
                                min={1}
                                max={3}
                                value={rule.score}
                                onChange={e => handleCriteriaChange(p.key, index, 'score', e.target.value)}
                                style={{ width: '80px', padding: '4px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem', textAlign: 'center', outline: 'none', fontWeight: 600 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)', color: '#050b1a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 240, 255, 0.15)' }}>
            <i className="fa-solid fa-save" style={{ marginRight: '6px' }}></i> Simpan Parameter & Kalkulasi Ulang
          </button>
        </div>
      </form>
    </>
  );
}
