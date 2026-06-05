import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Populasi from './pages/Populasi';
import RiskAnalysis from './pages/RiskAnalysis';
import RiskAnalysisDetail from './pages/RiskAnalysisDetail';
import TrendPrioritas from './pages/TrendPrioritas';
import PolaBayar from './pages/PolaBayar';
import Alerts from './pages/Alerts';
import Laporan from './pages/Laporan';
import LaporanPrint from './pages/LaporanPrint';
import Parameter from './pages/Parameter';
import DataMaster from './pages/DataMaster';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Guest Routes */}
        <Route path="/login" element={<Login />} />

        {/* Client-Side Printable Report (Protected, but rendered outside layout) */}
        <Route 
          path="/laporan/print" 
          element={
            <RequireAuth allowedRoles={['admin', 'analyst', 'management']}>
              <LaporanPrint />
            </RequireAuth>
          } 
        />

        {/* Protected Authenticated Routes with Sidebar Layout */}
        <Route 
          path="/" 
          element={
            <RequireAuth allowedRoles={['admin', 'analyst', 'management']}>
              <Layout />
            </RequireAuth>
          }
        >
          {/* Default Redirect to Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="populasi" element={<Populasi />} />
          <Route path="risk-analysis" element={<RiskAnalysis />} />
          <Route path="risk-analysis/:id" element={<RiskAnalysisDetail />} />
          <Route path="trend-prioritas" element={<TrendPrioritas />} />
          <Route path="pola-bayar" element={<PolaBayar />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="laporan" element={<Laporan />} />

          {/* Admin Protected Routes */}
          <Route 
            path="parameter" 
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Parameter />
              </RequireAuth>
            } 
          />
          <Route 
            path="data-master" 
            element={
              <RequireAuth allowedRoles={['admin']}>
                <DataMaster />
              </RequireAuth>
            } 
          />
          <Route 
            path="users" 
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Users />
              </RequireAuth>
            } 
          />
          <Route 
            path="settings" 
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Settings />
              </RequireAuth>
            } 
          />
        </Route>

        {/* Catch-all page redirect */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
