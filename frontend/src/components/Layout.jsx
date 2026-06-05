import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  Search, 
  TrendingUp, 
  CreditCard, 
  Bell, 
  FileText, 
  Sliders, 
  Database, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Clock 
} from 'lucide-react';
import api from '../services/api';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [time, setTime] = useState(new Date());

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'User', role: 'analyst', email: '' };

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme Sync Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'analyst', 'management'] },
    { label: 'Debtor Population', path: '/populasi', icon: UsersIcon, roles: ['admin', 'analyst'] },
    { label: 'Risk Analysis', path: '/risk-analysis', icon: Search, roles: ['admin', 'analyst', 'management'] },
    { label: 'Trend Prioritas', path: '/trend-prioritas', icon: TrendingUp, roles: ['admin', 'analyst', 'management'] },
    { label: 'Pola Bayar', path: '/pola-bayar', icon: CreditCard, roles: ['admin', 'analyst', 'management'] },
    { label: 'Alerts & Notifikasi', path: '/alerts', icon: Bell, roles: ['admin', 'analyst', 'management'] },
    { label: 'Laporan', path: '/laporan', icon: FileText, roles: ['admin', 'analyst', 'management'] },
  ];

  const adminItems = [
    { label: 'Parameter Skoring', path: '/parameter', icon: Sliders },
    { label: 'Data Master', path: '/data-master', icon: Database },
    { label: 'User Management', path: '/users', icon: UsersIcon },
    { label: 'Pengaturan Sistem', path: '/settings', icon: SettingsIcon },
  ];

  const getPageMeta = () => {
    const allItems = [...menuItems, ...adminItems];
    const currentItem = allItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
    if (currentItem) {
      return {
        title: currentItem.label,
        subtitle: `Halaman pengelolaan ${currentItem.label.toLowerCase()} skoring risiko.`
      };
    }
    return {
      title: 'Risk Scoring System',
      subtitle: 'Sistem Pemantauan dan Skoring Risiko Debitur Real-Time'
    };
  };

  const meta = getPageMeta();

  return (
    <div className="app-container">
      {/* Background Glowing Orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <h1 className="brand-name">RISK SCORE</h1>
            <span className="brand-subname">Real-Time Monitor</span>
          </div>
        </div>

        <nav>
          <p className="menu-title">Main Menu</p>
          <ul className="menu-items">
            {menuItems
              .filter(item => item.roles.includes(user.role))
              .map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <li key={item.path} className={`menu-item ${isActive ? 'active' : ''}`}>
                    <Link to={item.path}>
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
          </ul>

          {user.role === 'admin' && (
            <>
              <p className="menu-title">Administrator</p>
              <ul className="menu-items">
                {adminItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <li key={item.path} className={`menu-item ${isActive ? 'active' : ''}`}>
                      <Link to={item.path}>
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <h4 className="user-name">{user.name}</h4>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Keluar">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h2 className="page-title">{meta.title}</h2>
            <p className="page-subtitle">{meta.subtitle}</p>
          </div>

          <div className="header-actions">
            {/* Live Clock widget */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Clock size={16} className="text-secondary" />
              <span style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'monospace' }}>
                {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button 
              className="btn btn-secondary" 
              onClick={toggleTheme} 
              style={{ padding: '8px 12px', borderRadius: '12px' }}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Render page routing matches */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
