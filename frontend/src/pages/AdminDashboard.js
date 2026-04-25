import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
    ShieldAlert,
    Users,
    Database,
    Activity,
    CheckCircle,
    Trash2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const loginsOnly = false; // Kept as constant if needed for future toggle

    const { data: stats, isLoading: statsLoading } = useQuery(
        'admin-dashboard-stats',
        async () => {
            const response = await axios.get('/api/cases/stats/dashboard');
            return response.data;
        }
    );

    const { isLoading: activityLoading } = useQuery(
        ['admin-recent-activity', loginsOnly],
        async () => {
            const url = loginsOnly ? '/api/audit?limit=25&action=login' : '/api/audit?limit=5';
            const response = await axios.get(url);
            return response.data.logs;
        }
    );

    const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery(
        'admin-users-list',
        async () => {
            const response = await axios.get('/api/auth/users');
            return response.data.users;
        }
    );

    const { data: evidence, isLoading: evidenceLoading, refetch: refetchEvidence } = useQuery(
        'admin-evidence-list',
        async () => {
            const response = await axios.get('/api/evidence/all?limit=10');
            return response.data;
        }
    );

    const handleVerifyEvidence = async (evidenceId) => {
        try {
            const response = await axios.post(`/api/evidence/${evidenceId}/verify`);
            alert('Evidence verified successfully: ' + response.data.message);
            refetchEvidence();
        } catch (error) {
            console.error('Error verifying evidence:', error);
            alert('Verification failed: ' + (error?.response?.data?.message || 'Server error'));
        }
    };

    const handleRunGlobalVerification = async () => {
        try {
            const response = await axios.post('/api/evidence/verify/all');
            alert('Global verification completed: ' + response.data.message);
            refetchEvidence();
        } catch (error) {
            console.error('Error in global verification:', error);
            alert('Global verification failed.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user to prevent suspicious logins? This action cannot be undone.')) return;
        try {
            await axios.delete(`/api/auth/users/${userId}`);
            refetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error?.response?.data?.message || 'Failed to delete user.');
        }
    };

    const { data: systemSummary, isLoading: summaryLoading } = useQuery(
        'admin-system-summary',
        async () => {
            const response = await axios.get('/api/audit/system/summary');
            return response.data;
        }
    );

    const investigatorStats = systemSummary?.topUsers
        ?.map(u => ({
            name: `${u.user?.firstName || 'Unknown'} ${u.user?.lastName || ''}`.trim() || 'Unknown',
            actions: u.count
        }))
        .filter(u => u.name !== 'Unknown') || [];

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

            </div>

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
                            <p className="text-2xl font-bold text-dark-100 text-sm">Real-time Data Processing</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700">
                        <h2 className="text-xl font-semibold text-dark-100">Investigator Performance</h2>
                    </div>
                    <div className="card-body h-80 flex flex-col justify-center">
                        {investigatorStats && investigatorStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={investigatorStats}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '12px' }}
                                        cursor={{ fill: '#374151', opacity: 0.2 }}
                                    />
                                    <Bar dataKey="actions" name="Total Actions" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-6">
                                <Users className="h-6 w-6 text-dark-500 mx-auto mb-3" />
                                <p className="text-dark-400 text-sm italic">No investigator data available.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700">
                        <h2 className="text-xl font-semibold text-dark-100">Platform Activity Over Time</h2>
                    </div>
                    <div className="card-body h-80 flex flex-col justify-center">
                        {platformActivity && platformActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={platformActivity}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '12px' }}
                                    />
                                    <Line type="monotone" dataKey="activity" name="Platform Actions" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-6">
                                <Activity className="h-6 w-6 text-dark-500 mx-auto mb-3" />
                                <p className="text-dark-400 text-sm italic">Platform activity pending.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-dark-100">Case Status Overview</h2>
                    </div>
                    <div className="card-body h-80 flex flex-col justify-center">
                        {[
                            { name: 'Active', value: stats?.activeCases || 0, color: '#10b981' },
                            { name: 'Closed', value: stats?.closedCases || 0, color: '#6b7280' },
                            { name: 'Archived', value: stats?.archivedCases || 0, color: '#3b82f6' }
                        ].some(i => i.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Active', value: stats?.activeCases || 0, color: '#10b981' },
                                            { name: 'Closed', value: stats?.closedCases || 0, color: '#6b7280' },
                                            { name: 'Archived', value: stats?.archivedCases || 0, color: '#3b82f6' }
                                        ].filter(i => i.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {[
                                            { name: 'Active', value: stats?.activeCases || 0, color: '#10b981' },
                                            { name: 'Closed', value: stats?.closedCases || 0, color: '#6b7280' },
                                            { name: 'Archived', value: stats?.archivedCases || 0, color: '#3b82f6' }
                                        ].filter(i => i.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '12px' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-6">
                                <Database className="h-6 w-6 text-dark-500 mx-auto mb-3" />
                                <p className="text-dark-400 text-sm italic">No case data.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card min-h-[400px]">
                    <div className="card-header border-b border-dark-700">
                        <h2 className="text-xl font-semibold text-dark-100">Action Origin Distribution</h2>
                    </div>
                    <div className="card-body h-80 flex flex-col justify-center">
                        {actionDistribution && actionDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={actionDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {actionDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-6">
                                <ShieldAlert className="h-6 w-6 text-dark-500 mx-auto mb-3" />
                                <p className="text-dark-400 text-sm italic">Action distribution metrics pending.</p>
                            </div>
                        )}
                    </div>
                </div>


            </div>

            <div className="card mt-6">
                <div className="card-header border-b border-dark-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-dark-100 flex items-center">
                            <Users className="h-5 w-5 mr-2 text-primary-400" />
                            User Management & Access Control
                        </h2>
                    </div>
                </div>
                <div className="card-body overflow-x-auto">
                    {usersLoading ? (
                        <div className="flex justify-center p-6"><LoadingSpinner /></div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-dark-600 text-dark-300 text-sm">
                                    <th className="pb-3 pr-4 font-medium">Name</th>
                                    <th className="pb-3 pr-4 font-medium">Email</th>
                                    <th className="pb-3 pr-4 font-medium">Role</th>
                                    <th className="pb-3 pr-4 font-medium">Last Login</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users && users
                                    .map(u => {
                                        const isMe = u._id === currentUser?._id;
                                        return (
                                            <tr key={u._id} className={`border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors ${isMe ? 'bg-primary-500/5' : ''}`}>
                                                <td className="py-3 pr-4 text-sm text-dark-100 font-medium flex items-center">
                                                    {u.firstName} {u.lastName}
                                                    {isMe && (
                                                        <span className="ml-2 px-1.5 py-0.5 bg-primary-500 text-white text-[10px] rounded uppercase font-black">You</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-dark-300">{u.email}</td>
                                                <td className="py-3 pr-4 text-sm">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-blue-900/30 text-blue-400'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-dark-400">
                                                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                                                </td>
                                                <td className="py-3 text-right">
                                                    {!isMe && (
                                                        <button 
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded transition-colors"
                                                            title="Revoke Access"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
