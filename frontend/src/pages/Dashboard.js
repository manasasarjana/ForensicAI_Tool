import React from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  FolderOpen,
  FileText,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await axios.get('/api/cases/stats/dashboard');
      return response.data;
    }
  );

  // Priority Cases Queue (Fetch open cases, sort desc limit 5)
  const { data: casesData, isLoading: casesLoading } = useQuery(
    'priority-cases',
    async () => {
      const response = await axios.get('/api/cases?limit=5&status=active');
      return response.data.cases;
    }
  );

  // Recent Activity (Use as AI Pipeline & Evidence Pipeline)
  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'recent-activity',
    async () => {
      const response = await axios.get('/api/audit?limit=8');
      return response.data.logs;
    }
  );

  const getActionIcon = (action) => {
    switch(action) {
      case 'case_created': return <FolderOpen className="h-5 w-5 text-blue-400" />;
      case 'evidence_uploaded': return <Upload className="h-5 w-5 text-green-400" />;
      case 'report_generated': return <Zap className="h-5 w-5 text-purple-400" />;
      case 'case_closed': return <CheckCircle className="h-5 w-5 text-orange-400" />;
      case 'evidence_verified': return <Shield className="h-5 w-5 text-indigo-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (statsLoading || casesLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-900 absolute inset-0 z-50">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-primary-400 font-mono animate-pulse">Initializing Triage Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Glassmorphic Header */}
      <div className="bg-dark-800/40 backdrop-blur-md border border-dark-600/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-indigo-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary-500" />
              Forensic Triage Center
            </h1>
            <p className="text-dark-300 mt-2 text-sm max-w-2xl">
              Welcome back, Agent <span className="font-bold text-primary-400 uppercase tracking-widest">{user?.lastName || user?.firstName}</span>. 
              All backend AI workers are listening. Queue is healthy.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link to="/cases/new" className="bg-primary-600/20 hover:bg-primary-600/40 border border-primary-500/50 text-primary-100 px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center">
              <FolderOpen className="h-4 w-4 mr-2" /> New Case
            </Link>
            <Link to="/evidence" className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-100 px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center">
              <Upload className="h-4 w-4 mr-2" /> Ingest Data
            </Link>
          </div>
        </div>
      </div>

      {/* Cyber Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Investigations', value: stats?.activeCases || 0, icon: FolderOpen, color: 'blue' },
          { label: 'Evidence Objects', value: stats?.totalEvidence || 0, icon: Shield, color: 'green' },
          { label: 'AI Reports Generated', value: stats?.totalReports || 0, icon: FileText, color: 'purple' },
          { label: 'Closed Cases', value: stats?.closedCases || 0, icon: CheckCircle, color: 'orange' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`bg-dark-800/60 backdrop-blur border border-dark-700 p-6 rounded-xl relative overflow-hidden group hover:border-${stat.color}-500/50 transition-all duration-300`}>
              <div className={`absolute -right-4 -top-4 bg-${stat.color}-500/10 p-6 rounded-full group-hover:scale-110 transition-transform`}>
                <Icon className={`h-12 w-12 text-${stat.color}-500/20`} />
              </div>
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg bg-${stat.color}-500/20 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div className="ml-4 z-10">
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-dark-100 mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Priority Case Queue */}
        <div className="bg-dark-800/40 backdrop-blur border border-dark-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-5 border-b border-dark-700 bg-dark-900/30 flex justify-between items-center">
            <h2 className="text-lg font-bold text-dark-100 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" /> Priority Case Queue
            </h2>
            <Link to="/cases" className="text-xs text-primary-400 hover:text-primary-300 uppercase tracking-wider font-bold">View All</Link>
          </div>
          <div className="flex-1 p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/50 text-dark-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Case ID</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {casesData && casesData.length > 0 ? casesData.map(c => (
                  <tr key={c._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="p-4 font-mono text-dark-300">{c.caseId}</td>
                    <td className="p-4 text-dark-100 font-medium">{c.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-sm ${
                        c.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        c.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => navigate(`/cases/${c._id}`)} className="text-primary-400 hover:text-primary-300 p-2 hover:bg-primary-900/20 rounded transition-colors inline-block">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-dark-400">No active priority cases. System clear.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;