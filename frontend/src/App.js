import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CasesPage from './pages/CasesPage';
import CaseCreatePage from './pages/CaseCreatePage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import EvidencePage from './pages/EvidencePage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!user ? <LandingPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
        <Route path="/login" element={!user ? <LoginPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
        <Route path="/admin/login" element={!user ? <AdminLoginPage /> : <Navigate to="/admin" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />

        {/* Protected routes */}
        <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/cases" element={user ? <Layout><CasesPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/cases/new" element={user ? <Layout><CaseCreatePage /></Layout> : <Navigate to="/login" />} />
        <Route path="/cases/:id" element={user ? <Layout><CaseDetailsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/evidence" element={user ? <Layout><EvidencePage /></Layout> : <Navigate to="/login" />} />
        <Route path="/reports" element={user ? <Layout><ReportsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/reports/:id" element={user ? <Layout><ReportDetailsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/audit" element={user ? <Layout><AuditLogsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Layout><ProfilePage /></Layout> : <Navigate to="/login" />} />

        {/* Admin protected routes */}
        <Route path="/admin" element={user && user.role === 'admin' ? <Layout><AdminDashboard /></Layout> : <Navigate to="/dashboard" />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={!user ? "/" : (user.role === 'admin' ? "/admin" : "/dashboard")} />} />
      </Routes>
    </div>
  );
}

export default App;