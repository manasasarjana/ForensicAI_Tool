import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import ReportAnalystDashboard from './pages/ReportAnalystDashboard';
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
    <ThemeProvider>
      <div className="min-h-screen bg-dark-900 dark:bg-dark-950 transition-colors duration-300">
        <Routes>
          {/* Public routes */ }
          <Route path="/" element={!user ? <LandingPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : (user.role === 'analyst' ? <Navigate to="/analyst" /> : <Navigate to="/dashboard" />))} />
          <Route path="/login" element={!user ? <LoginPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : (user.role === 'analyst' ? <Navigate to="/analyst" /> : <Navigate to="/dashboard" />))} />
          <Route path="/admin/login" element={!user ? <AdminLoginPage /> : <Navigate to="/admin" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : (user.role === 'analyst' ? <Navigate to="/analyst" /> : <Navigate to="/dashboard" />))} />

          {/* Protected routes - Investigators Only */}
          <Route path="/dashboard" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Layout><Dashboard /></Layout>) : <Navigate to="/login" />} />
          <Route path="/cases" element={user && user.role !== 'admin' ? <Layout><CasesPage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/cases/new" element={user && user.role !== 'admin' ? <Layout><CaseCreatePage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/cases/:id" element={user && user.role !== 'admin' ? <Layout><CaseDetailsPage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/evidence" element={user && user.role !== 'admin' ? <Layout><EvidencePage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/reports" element={user && user.role !== 'admin' ? <Layout><ReportsPage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/reports/:id" element={user && user.role !== 'admin' ? <Layout><ReportDetailsPage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/audit" element={user && user.role !== 'admin' ? <Layout><AuditLogsPage /></Layout> : <Navigate to={user ? "/admin" : "/login"} />} />
          <Route path="/profile" element={user ? <Layout><ProfilePage /></Layout> : <Navigate to="/login" />} />

          {/* Admin protected routes */}
          <Route path="/admin" element={user && user.role === 'admin' ? <Layout><AdminDashboard /></Layout> : <Navigate to="/dashboard" />} />

          {/* Analyst protected routes */}
          <Route path="/analyst" element={user && user.role === 'analyst' ? <Layout><ReportAnalystDashboard /></Layout> : <Navigate to="/dashboard" />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to={!user ? "/" : (user.role === 'admin' ? "/admin" : (user.role === 'analyst' ? "/analyst" : "/dashboard"))} />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;