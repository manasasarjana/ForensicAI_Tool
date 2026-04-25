import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Shield, Activity, Clock, User, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    severity: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch audit logs
  const { data, isLoading, error, refetch } = useQuery(
    ['auditLogs', page, filters],
    async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      });
      const response = await axios.get(`/api/audit?${queryParams}`);
      return response.data;
    },
    {
      staleTime: 30000,
      cacheTime: 60000,
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      action: '',
      resource: '',
      severity: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  // Get severity icon and color
  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: 'bg-green-900/30 border border-green-700', text: 'text-green-400' },
      medium: { color: 'bg-yellow-900/30 border border-yellow-700', text: 'text-yellow-400' },
      high: { color: 'bg-orange-900/30 border border-orange-700', text: 'text-orange-400' },
      critical: { color: 'bg-red-900/30 border border-red-700', text: 'text-red-400' }
    };
    const config = severityConfig[severity] || severityConfig.low;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color} ${config.text}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  // Get status icon
  const getStatusIcon = (success) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  // Format action text
  const formatAction = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Audit Logs</h1>
          <p className="text-dark-300 mt-2">Monitor system activity and security events</p>
        </div>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-400">Error loading audit logs: {error.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-300 rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const logs = data?.logs || [];
  const pagination = data?.pagination || { current: 1, pages: 1, total: 0 };

  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.keys(actionCounts).map(key => ({
    name: formatAction(key),
    value: actionCounts[key]
  }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-100 dark:text-dark-50 transition-colors">Audit Logs</h1>
        <p className="text-dark-400 dark:text-dark-300 mt-2">Monitor system activity and security events</p>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleResetFilters}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !filters.action && !filters.resource
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 border border-dark-200 dark:border-dark-600'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => {
            handleResetFilters();
            handleFilterChange('action', 'login');
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filters.action === 'login'
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 border border-dark-200 dark:border-dark-600'
          }`}
        >
          Logins Only
        </button>
        <button
          onClick={() => {
            handleResetFilters();
            handleFilterChange('resource', 'case');
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filters.resource === 'case'
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 border border-dark-200 dark:border-dark-600'
          }`}
        >
          Case Operations
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-dark-200 dark:border-dark-600 shadow-sm transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-dark-100 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="case_created">Case Created</option>
              <option value="evidence_uploaded">Evidence Uploaded</option>
              <option value="report_generated">Report Generated</option>
              <option value="report_finalized">Report Finalized</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-dark-100 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">All Resources</option>
              <option value="case">Case</option>
              <option value="evidence">Evidence</option>
              <option value="report">Report</option>
              <option value="user">User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-dark-100 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-dark-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-dark-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleResetFilters}
          className="mt-4 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-dark-200 rounded transition text-sm"
        >
          Reset Filters
        </button>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner message="Loading audit logs..." />}

      {/* No Logs State */}
      {!isLoading && logs.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-dark-100 mb-2">No Audit Logs Found</h3>
          <p className="text-dark-400">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Logs Table */}
      {!isLoading && logs.length > 0 && (
        <>
          {/* Visualizations row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-dark-700 rounded-lg p-6 border border-dark-600">
              <h3 className="text-lg font-medium text-dark-100 mb-4">Activity Breakdown</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-6 border border-dark-600 flex flex-col justify-center items-center text-center">
              <Activity className="h-12 w-12 text-primary-500 mb-3" />
              <h3 className="text-xl font-medium text-dark-100">System Insight</h3>
              <p className="text-dark-300 mt-2 max-w-sm">
                You are currently viewing <strong>{logs.length}</strong> activities matching your advanced filter, out of <strong>{pagination.total}</strong> total logged system events.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-600 overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-600">
                <thead className="bg-dark-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-dark-600/50 transition">
                      <td className="px-6 py-3 whitespace-nowrap">
                        {getStatusIcon(log.success)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-dark-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-dark-100">
                              {log.userId?.firstName} {log.userId?.lastName}
                            </p>
                            <p className="text-xs text-dark-400">{log.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <p className="text-sm text-dark-100">{formatAction(log.action)}</p>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-dark-400 mr-2" />
                          <span className="text-sm text-dark-200 capitalize">{log.resource || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-dark-400 mr-2" />
                          <span className="text-sm text-dark-200">{formatTimestamp(log.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-dark-600 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-dark-300">
                Showing page <span className="font-medium">{pagination.current}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span> (Total: {pagination.total} logs)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="flex items-center px-3 text-dark-200">{page}</span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogsPage;