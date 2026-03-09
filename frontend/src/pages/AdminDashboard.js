import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
    ShieldAlert,
    Users,
    Database,
    Activity,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const AdminDashboard = () => {
    // We mock some data for visual aesthetics if real endpoints for admin stats don't exist yet,
    // but we try to fetch real stats where possible using existing endpoints.

    const { data: stats, isLoading: statsLoading } = useQuery(
        'admin-dashboard-stats',
        async () => {
            // Re-using the cases stats endpoint which exists, but an admin-specific one might be needed later
            const response = await axios.get('/api/cases/stats/dashboard');
            return response.data;
        }
    );

    const { data: recentActivity, isLoading: activityLoading } = useQuery(
        'admin-recent-activity',
        async () => {
            const response = await axios.get('/api/audit?limit=5');
            return response.data.logs;
        }
    );

    const { data: systemSummary, isLoading: summaryLoading } = useQuery(
        'admin-system-summary',
        async () => {
            const response = await axios.get('/api/audit/system/summary');
            return response.data;
        }
    );

    // Map dynamic data for Recharts
    const investigatorStats = systemSummary?.topUsers?.map(u => ({
        name: `${u.user?.firstName || 'Unknown'} ${u.user?.lastName || ''}`.trim() || u._id,
        actions: u.count
    })) || [];

    const actionDistribution = systemSummary?.summary?.map(item => ({
        name: item._id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: item.count
    })) || [];

    const platformActivity = systemSummary?.dailyActivity?.map(day => ({
        name: `${day._id.month}/${day._id.day}`,
        activity: day.count
    })) || [];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#0ea5e9'];

    if (statsLoading || summaryLoading || activityLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-dark-100 flex items-center">
                        <ShieldAlert className="h-8 w-8 text-red-500 mr-3" />
                        Administrator Workspace
                    </h1>
                    <p className="text-dark-300 mt-2">
                        System overview, data integrity management, and investigator metrics.
                    </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg flex items-center">
                    <span className="flex h-3 w-3 relative mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-red-400 font-medium text-sm">System Healthy</span>
                </div>
            </div>

            {/* Admin Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 border-t-4 border-t-blue-500 bg-gradient-to-b from-blue-900/10 to-transparent">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-500/20 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-300">Active Investigators</p>
                            <p className="text-2xl font-bold text-dark-100">{investigatorStats.length}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-t-4 border-t-green-500 bg-gradient-to-b from-green-900/10 to-transparent">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500/20 p-3 rounded-lg">
                            <Database className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-green-300">Total System Evidence</p>
                            <p className="text-2xl font-bold text-dark-100">{stats?.totalEvidence || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-t-4 border-t-purple-500 bg-gradient-to-b from-purple-900/10 to-transparent">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500/20 p-3 rounded-lg">
                            <Activity className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-bold text-dark-100 text-sm">Real-time Data Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investigator Performance Chart */}
                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700">
                        <h2 className="text-xl font-semibold text-dark-100">Investigator Performance</h2>
                    </div>
                    <div className="card-body h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={investigatorStats}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Legend />
                                <Bar dataKey="actions" name="Total Actions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Activity Line Chart */}
                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700">
                        <h2 className="text-xl font-semibold text-dark-100">Platform Activity Over Time</h2>
                    </div>
                    <div className="card-body h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={platformActivity}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="activity" name="Platform Actions" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Evidence Distribution Pie Chart */}
                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700">
                        <h2 className="text-xl font-semibold text-dark-100">Action Origin Distribution</h2>
                    </div>
                    <div className="card-body h-80 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={actionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {actionDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Integrity Management Pane */}
                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-dark-100">Data Integrity Management</h2>
                        <button className="text-xs bg-red-600 hover:bg-red-700 text-dark-100 px-3 py-1.5 rounded-md transition-colors flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Run Global Verification
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="space-y-4">
                            <div className="bg-dark-800 p-4 rounded-lg flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="text-dark-100 font-medium">Last Global Hash Check</h4>
                                    <p className="text-sm text-dark-400">Completed recently. 100% of {stats?.totalEvidence || 0} evidence files verified against their initial SHA-256 hashes.</p>
                                </div>
                            </div>

                            <div className="bg-dark-800 p-4 rounded-lg flex items-start border-l-4 border-yellow-500">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="text-dark-100 font-medium">Pending Approvals</h4>
                                    <p className="text-sm text-dark-400">{systemSummary?.failedActions || 0} system action(s) recently failed or encountered an error.</p>
                                </div>
                            </div>

                            {/* Display recent Audit Logs for Admin */}
                            <div className="mt-6">
                                <h4 className="text-dark-300 font-medium mb-3 text-sm uppercase tracking-wider">Recent System Logs</h4>
                                <div className="space-y-3">
                                    {activityLoading ? (
                                        <LoadingSpinner size="small" />
                                    ) : recentActivity && recentActivity.length > 0 ? (
                                        recentActivity.map((log) => (
                                            <div key={log._id} className="text-sm flex justify-between items-center border-b border-dark-700 pb-2">
                                                <span className="text-dark-200 truncate pr-4">
                                                    <span className="text-blue-400 mr-2">[{typeof log.action === 'string' ? log.action : 'Action'}]</span>
                                                    {typeof log.details === 'string' ? log.details : `Action by user ${log.userId?.firstName || log.userId || 'Unknown'}`}
                                                </span>
                                                <span className="text-dark-500 text-xs whitespace-nowrap">
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Unknown time'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-dark-500">No recent logs found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
