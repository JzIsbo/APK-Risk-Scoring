import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Populasi from './pages/Populasi';
import RiskAnalysis from './pages/RiskAnalysis';
import RiskDetail from './pages/RiskDetail';
import TrendPrioritas from './pages/TrendPrioritas';
import PolaBayar from './pages/PolaBayar';
import Alerts from './pages/Alerts';
import Laporan from './pages/Laporan';
import LaporanPrint from './pages/LaporanPrint';
import Parameter from './pages/Parameter';
import DataMaster from './pages/DataMaster';
import Users from './pages/Users';
import Settings from './pages/Settings';

// Route Guard for Authenticated Users
function RequireAuth({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Route Guard for Admin Role
function RequireAdmin({ children }) {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Decoupled Print Layout Route (No Layout wrapper) */}
        <Route path="/laporan-print" element={
          <RequireAuth>
            <LaporanPrint />
          </RequireAuth>
        } />

        {/* Main Application Layout Protected Routes */}
        <Route element={<Layout title="Dashboard Pemantauan Risiko" subtitle="Berikut ringkasan data risiko real-time terbaru." />}>
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Populasi Debitur" subtitle="Manajemen database populasi debitur dan data mentah parameter." />}>
          <Route path="/populasi" element={<RequireAuth><Populasi /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Risk Analysis & Prioritas" subtitle="Analisis risiko debitur diurutkan berdasarkan skor kerentanan tertinggi." />}>
          <Route path="/risk-analysis" element={<RequireAuth><RiskAnalysis /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Profil Detil Risiko Debitur" subtitle="Breakdown kontribusi skor per parameter dan profil sejenis." />}>
          <Route path="/risk-analysis/:id" element={<RequireAuth><RiskDetail /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Tren Prioritas Risiko" subtitle="Analisis visual perkembangan risiko dan pertumbuhan MoM kelas CO." />}>
          <Route path="/trend-prioritas" element={<RequireAuth><TrendPrioritas /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Analisis Pola Bayar" subtitle="Tren keterlambatan pembayaran bulanan, pola bayar akhir, dan PS AMBC." />}>
          <Route path="/pola-bayar" element={<RequireAuth><PolaBayar /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Pusat Peringatan & Notifikasi" subtitle="Daftar anomali risiko tinggi dan debtor dalam pengawasan khusus." />}>
          <Route path="/alerts" element={<RequireAuth><Alerts /></RequireAuth>} />
        </Route>

        <Route element={<Layout title="Laporan & Ekspor Data" subtitle="Generator ringkasan analisis untuk kebutuhan pelaporan cetak (PDF) atau spreadsheet." />}>
          <Route path="/laporan" element={<RequireAuth><Laporan /></RequireAuth>} />
        </Route>

        {/* Admin Configuration Protected Routes */}
        <Route element={<Layout title="Parameter & Aturan Risiko" subtitle="Konfigurasi bobot kontribusi parameter dan rentang kriteria level risiko." />}>
          <Route path="/parameter" element={<RequireAdmin><Parameter /></RequireAdmin>} />
        </Route>

        <Route element={<Layout title="Data Master Sistem" subtitle="Kelola opsi isian dropdown parameter dan log pencatatan periode." />}>
          <Route path="/data-master" element={<RequireAdmin><DataMaster /></RequireAdmin>} />
        </Route>

        <Route element={<Layout title="Manajemen Pengguna" subtitle="Atur daftar staf analis, administrator, dan pimpinan yang dapat masuk." />}>
          <Route path="/users" element={<RequireAdmin><Users /></RequireAdmin>} />
        </Route>

        <Route element={<Layout title="Pengaturan Ambang Batas" subtitle="Tentukan skor klasifikasi global untuk pengelompokan level risiko." />}>
          <Route path="/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
