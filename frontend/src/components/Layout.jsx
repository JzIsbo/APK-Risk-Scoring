import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import api from '../services/api';

export default function Layout({ title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [liveTime, setLiveTime] = useState('');

  // Fetch current user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Fallback API check
      api.get('/me')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          navigate('/login');
        });
    }
  }, [navigate]);

  // Live ticking clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setLiveTime(now.toLocaleString('id-ID', options).replace(/\./g, ':'));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme management matching exactly the CSS definitions
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!user) return <div className="loading-container">Memuat profil...</div>;

  const role = user.role;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon">
            <i className="fa-solid fa-chart-line" style={{ color: '#060919', fontSize: '1.25rem' }}></i>
          </div>
          <div>
            <h1 className="brand-name">RISK DASHBOARD</h1>
            <span className="brand-subname">Monitoring & Analytics</span>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ul className="menu-items">
            <li className={`menu-item ${location.pathname === '/' || location.pathname === '/dashboard' ? 'active' : ''}`}>
              <Link to="/dashboard">
                <i className="fa-solid fa-chart-simple"></i>
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>

          <span className="menu-title">Menu Utama</span>
          <ul className="menu-items">
            {(role === 'admin' || role === 'analyst') && (
              <li className={`menu-item ${location.pathname === '/populasi' ? 'active' : ''}`}>
                <Link to="/populasi">
                  <i className="fa-solid fa-users"></i>
                  <span>Populasi</span>
                </Link>
              </li>
            )}
            <li className={`menu-item ${location.pathname.startsWith('/risk-analysis') ? 'active' : ''}`}>
              <Link to="/risk-analysis">
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                <span>Risk Analysis</span>
              </Link>
            </li>
            <li className={`menu-item ${location.pathname === '/trend-prioritas' ? 'active' : ''}`}>
              <Link to="/trend-prioritas">
                <i className="fa-solid fa-chart-line"></i>
                <span>Trend Prioritas</span>
              </Link>
            </li>
            <li className={`menu-item ${location.pathname === '/pola-bayar' ? 'active' : ''}`}>
              <Link to="/pola-bayar">
                <i className="fa-solid fa-receipt"></i>
                <span>Pola Bayar</span>
              </Link>
            </li>
            <li className={`menu-item ${location.pathname === '/alerts' ? 'active' : ''}`}>
              <Link to="/alerts">
                <i className="fa-solid fa-bell"></i>
                <span>Alert & Notifikasi</span>
              </Link>
            </li>
            <li className={`menu-item ${location.pathname === '/laporan' ? 'active' : ''}`}>
              <Link to="/laporan">
                <i className="fa-solid fa-file-lines"></i>
                <span>Laporan</span>
              </Link>
            </li>
          </ul>

          {role === 'admin' && (
            <>
              <span className="menu-title">Konfigurasi</span>
              <ul className="menu-items">
                <li className={`menu-item ${location.pathname === '/parameter' ? 'active' : ''}`}>
                  <Link to="/parameter">
                    <i className="fa-solid fa-sliders"></i>
                    <span>Parameter Risk</span>
                  </Link>
                </li>
                <li className={`menu-item ${location.pathname === '/data-master' ? 'active' : ''}`}>
                  <Link to="/data-master">
                    <i className="fa-solid fa-database"></i>
                    <span>Data Master</span>
                  </Link>
                </li>
                <li className={`menu-item ${location.pathname === '/users' ? 'active' : ''}`}>
                  <Link to="/users">
                    <i className="fa-solid fa-user-gear"></i>
                    <span>Pengguna</span>
                  </Link>
                </li>
                <li className={`menu-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                  <Link to="/settings">
                    <i className="fa-solid fa-gear"></i>
                    <span>Pengaturan</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <div className="sidebar-user" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '0.8rem' }}>
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="user-info" style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
              <div className="user-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={user.name}>{user.name}</div>
              <div className="user-role" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {role === 'admin' ? 'Administrator' : role === 'analyst' ? 'Analis Risiko' : 'Manajemen'}
              </div>
            </div>
          </div>
          
          <div className="menu-item" style={{ listStyle: 'none' }}>
            <a href="#logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 12px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', borderRadius: '12px', fontWeight: 600 }}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Keluar</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Section */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header className="top-header">
          <div>
            <h2 className="page-title">{title}</h2>
            <p className="page-subtitle">{subtitle}</p>
          </div>
          <div className="header-actions">
            <button id="theme-toggle" className="glass-card" onClick={toggleTheme} style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignApp: 'center', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)' }}>
              <i id="theme-toggle-icon" className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} style={{ color: theme === 'light' ? 'var(--color-purple)' : 'var(--color-cyan)' }}></i>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <div className="glass-card" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignApp: 'center', alignItems: 'center', gap: '8px' }}>
              <i className="fa-regular fa-calendar"></i>
              <span>{liveTime || 'Memuat waktu...'}</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
