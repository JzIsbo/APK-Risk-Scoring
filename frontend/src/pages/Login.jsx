import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Kredensial yang diberikan tidak cocok dengan catatan kami.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'var(--bg-main)',
      backgroundImage: 'var(--bg-gradient)',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Background decorations matching welcome screen */}
      <div className="glow-orb orb-1" style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div className="glow-orb orb-2" style={{ position: 'absolute', bottom: '15%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)', zIndex: 0 }}></div>

      <div className="glass-card login-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Brand logo illustration */}
        <div className="brand-logo-glow" style={{
          width: '70px',
          height: '70px',
          margin: '0 auto 24px auto',
          background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
        }}>
          <i className="fa-solid fa-chart-line" style={{ fontSize: '2rem', color: '#050b1a' }}></i>
        </div>

        <h2 className="display-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>RISK SCORING</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>Silakan masuk untuk mengakses dasbor analisis risiko</p>

        {error && (
          <div className="alert alert-danger" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="fa-solid fa-circle-xmark" style={{ color: '#ef4444' }}></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat Email</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kata Sandi</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-blue) 100%)',
              color: '#050b1a',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 240, 255, 0.2)',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Memproses masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk</span>
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Aplikasi Risk Assessment Debtor v2.0 &bull; Sistem Monitoring Kepatuhan Risiko
          </p>
        </div>
      </div>
    </div>
  );
}
