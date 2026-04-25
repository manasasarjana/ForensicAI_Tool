import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    TrendingUp,
    FileSearch,
    BookOpen
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const ReportAnalystDashboard = () => {
    const navigate = useNavigate();

    const { data: reportsData, isLoading: reportsLoading } = useQuery(
        'analyst-reports',
        async () => {
            const response = await axios.get('/api/reports?limit=10');
            return response.data.reports;
        }
    );

    const { data: stats, isLoading: statsLoading } = useQuery(
        'analyst-stats',
        async () => {
            const response = await axios.get('/api/cases/stats/dashboard');
            return response.data;
        }
    );

    if (reportsLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    const pendingReview = reportsData?.filter(r => r.status === 'completed') || [];
    const finalized = reportsData?.filter(r => r.status === 'finalized') || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-100 flex items-center">
                        <FileSearch className="h-8 w-8 text-blue-500 mr-3" />
                        Analyst Workspace
                    </h1>
                    <p className="text-dark-300 mt-2">
                        Review, validate, and finalize AI-generated forensic reports.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => navigate('/cases')}
                        className="btn-primary"
                    >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Cases
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card p-4 bg-gradient-to-br from-blue-900/20 to-transparent border-l-4 border-l-blue-500">
                    <p className="text-dark-400 text-sm font-medium">Reports Pending Review</p>
                    <p className="text-3xl font-bold text-dark-100 mt-1">{pendingReview.length}</p>
                </div>
                <div className="card p-4 bg-gradient-to-br from-green-900/20 to-transparent border-l-4 border-l-green-500">
                    <p className="text-dark-400 text-sm font-medium">Finalized This Month</p>
                    <p className="text-3xl font-bold text-dark-100 mt-1">{finalized.length}</p>
                </div>
                <div className="card p-4 bg-gradient-to-br from-purple-900/20 to-transparent border-l-4 border-l-purple-500">
                    <p className="text-dark-400 text-sm font-medium">Total Cases Active</p>
                    <p className="text-3xl font-bold text-dark-100 mt-1">{stats?.activeCases || 0}</p>
                </div>
                <div className="card p-4 bg-gradient-to-br from-orange-900/20 to-transparent border-l-4 border-l-orange-500">
                    <p className="text-dark-400 text-sm font-medium">Processing Queue</p>
                    <p className="text-3xl font-bold text-dark-100 mt-1">
                        {reportsData?.filter(r => r.status === 'processing').length || 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="card-header border-b border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-100 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-orange-400" />
                                Review Queue
                            </h2>
                            <button 
                                onClick={() => navigate('/reports')}
                                className="text-sm text-primary-400 hover:underline"
                            >
                                View All Reports
                            </button>
                        </div>
                        <div className="card-body">
                            {pendingReview.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingReview.map(report => (
                                        <div 
                                            key={report._id}
                                            className="group flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary-500/50 transition-all cursor-pointer"
                                            onClick={() => navigate(`/reports/${report._id}`)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                    <FileText className="h-6 w-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-dark-100 font-medium">{report.title}</h3>
                                                    <p className="text-xs text-dark-400 mt-0.5">
                                                        Case: {report.caseId?.caseId} • Generated {new Date(report.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] rounded uppercase font-bold tracking-wider">
                                                    Needs Review
                                                </span>
                                                <CheckCircle className="h-5 w-5 text-dark-500 group-hover:text-primary-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-dark-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 border border-dark-700">
                                        <CheckCircle className="h-8 w-8 text-dark-600" />
                                    </div>
                                    <h3 className="text-dark-200 font-medium">Review Queue Clear</h3>
                                    <p className="text-dark-500 text-sm mt-1">All generated reports have been processed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="card">
                        <div className="card-header border-b border-dark-700">
                            <h2 className="text-lg font-semibold text-dark-100 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-purple-400" />
                                Analyst Guidelines
                            </h2>
                        </div>
                        <div className="card-body text-sm space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                <p className="text-dark-300">Verify evidence hashes match original ingestion records.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                <p className="text-dark-300">Ensure timeline events correlate with system artifact timestamps.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                <p className="text-dark-300">Redact any personally identifiable information (PII) not relevant to the case.</p>
                            </div>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
                                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-red-400 text-xs">Finalizing a report locks it for legal submission.</span>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-primary-600/20 to-transparent border border-primary-500/30">
                        <div className="card-body">
                            <h3 className="text-primary-400 font-bold text-lg mb-2">Need AI Assistance?</h3>
                            <p className="text-sm text-dark-300 mb-4">
                                You can re-generate specific sections of the report using updated context from evidence details.
                            </p>
                            <button className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">
                                Open Context Editor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportAnalystDashboard;
