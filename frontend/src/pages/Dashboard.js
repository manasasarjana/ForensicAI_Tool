import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FolderOpen,
  FileText,
  Upload,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await axios.get('/api/cases/stats/dashboard');
      return response.data;
    }
  );

  // Fetch recent activity (audit logs)
  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'recent-activity',
    async () => {
      const response = await axios.get('/api/audit?limit=10');
      return response.data.logs;
    }
  );

  const quickActions = [
    {
      title: 'Create New Case',
      description: 'Start a new forensic investigation',
      icon: FolderOpen,
      href: '/cases',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Upload Evidence',
      description: 'Add digital evidence to existing case',
      icon: Upload,
      href: '/evidence',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Generate Report',
      description: 'Create AI-powered forensic report',
      icon: FileText,
      href: '/reports',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'View Analytics',
      description: 'Review case statistics and trends',
      icon: BarChart3,
      href: '/audit',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: 'status-badge bg-green-100 text-green-800',
      draft: 'status-badge bg-yellow-100 text-yellow-800',
      completed: 'status-badge bg-blue-100 text-blue-800',
      finalized: 'status-badge bg-purple-100 text-purple-800',
      processing: 'status-badge bg-orange-100 text-orange-800',
      closed: 'status-badge bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.draft;
  };

  const getActionIcon = (action) => {
    const icons = {
      login: Clock,
      case_created: FolderOpen,
      evidence_uploaded: Upload,
      report_generated: FileText,
      report_finalized: CheckCircle
    };
    const Icon = icons[action] || AlertCircle;
    return Icon;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-100">Dashboard</h1>
        <p className="text-dark-300 mt-2">
          Welcome back! Here's an overview of your forensic investigations.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-400">Active Cases</p>
              <p className="text-2xl font-bold text-dark-100">{stats?.activeCases || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Upload className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-400">Evidence Files</p>
              <p className="text-2xl font-bold text-dark-100">{stats?.totalEvidence || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-400">Reports Generated</p>
              <p className="text-2xl font-bold text-dark-100">{stats?.totalReports || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-400">Closed Cases</p>
              <p className="text-2xl font-bold text-dark-100">{stats?.closedCases || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-dark-100">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className={`${action.color} text-dark-100 p-4 rounded-lg transition-colors duration-200 hover:shadow-lg`}
                >
                  <div className="flex items-center">
                    <Icon className="h-6 w-6 mr-3" />
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Activity Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-dark-100">Case Activity</h2>
          </div>
          <div className="card-body">
            {stats?.casesByMonth && stats.casesByMonth.length > 0 ? (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.casesByMonth.map(month => ({
                    name: new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
                    count: month.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      cursor={{ fill: '#374151', opacity: 0.4 }}
                    />
                    <Bar dataKey="count" name="New Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-400">No case activity data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-dark-100">Recent Activity</h2>
          </div>
          <div className="card-body">
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActionIcon(activity.action);
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary-500 mt-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-100">
                          <span className="font-medium">
                            {activity.userId?.firstName} {activity.userId?.lastName}
                          </span>
                          {' '}
                          <span className="text-dark-300">
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                        </p>
                        <p className="text-xs text-dark-400">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;