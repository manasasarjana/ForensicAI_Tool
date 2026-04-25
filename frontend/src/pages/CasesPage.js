import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, Eye, Calendar, User } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CasesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    ['cases', { page, search: searchTerm, status: statusFilter, priority: priorityFilter }],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const response = await axios.get(`/api/cases?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading cases: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Cases</h1>
          <p className="text-dark-300 mt-2">Manage your forensic investigations</p>
        </div>
        <Link to="/cases/new" className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-dark-800/40 backdrop-blur border border-dark-700/50 rounded-xl p-4 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
      </div>

      {/* Cases Table */}
      <div className="bg-dark-800/40 backdrop-blur border border-dark-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900/50 text-dark-400 text-xs uppercase tracking-wider border-b border-dark-700">
              <tr>
                <th className="p-4 font-medium">Case ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Investigator</th>
              <th>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data?.cases?.map((caseItem) => (
                <tr key={caseItem._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                  <span className="font-mono text-sm text-primary-400">{caseItem.caseId}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-white">{caseItem.title}</p>
                    {caseItem.description && (
                      <p className="text-sm text-dark-400 truncate max-w-xs">
                        {caseItem.description}
                      </p>
                    )}
                  </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-sm ${
                      caseItem.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      caseItem.status === 'closed' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-sm ${
                      caseItem.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      caseItem.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="p-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-dark-400 mr-2" />
                    <span className="text-sm text-dark-200">
                      {caseItem.investigator ? `${caseItem.investigator.firstName} ${caseItem.investigator.lastName}` : 'Unknown Investigator'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-xs text-dark-400 font-mono">
                      <Calendar className="h-3 w-3 mr-1" />
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/cases/${caseItem._id}`}
                      className="text-primary-400 hover:text-primary-300 p-2 hover:bg-primary-900/20 rounded transition-colors inline-block"
                      title="Inspect Case"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
            ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-400">
            Showing {((data.pagination.current - 1) * 10) + 1} to{' '}
            {Math.min(data.pagination.current * 10, data.pagination.total)} of{' '}
            {data.pagination.total} results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= data.pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data?.cases?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-dark-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dark-100 mb-2">No cases found</h3>
          <p className="text-dark-400 mb-6">
            {searchTerm || statusFilter || priorityFilter
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first case'
            }
          </p>
          <Link to="/cases/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create New Case
          </Link>
        </div>
      )}
    </div>
  );
};

export default CasesPage;