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

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      archived: 'bg-blue-100 text-blue-800'
    };
    return `status-badge ${badges[status] || badges.active}`;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return `status-badge ${badges[priority] || badges.medium}`;
  };

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
      <div className="card">
        <div className="card-body">
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
      </div>

      {/* Cases Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th>Case ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Investigator</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {data?.cases?.map((caseItem) => (
              <tr key={caseItem._id}>
                <td>
                  <span className="font-mono text-sm">{caseItem.caseId}</span>
                </td>
                <td>
                  <div>
                    <p className="font-medium text-dark-100">{caseItem.title}</p>
                    {caseItem.description && (
                      <p className="text-sm text-dark-400 truncate max-w-xs">
                        {caseItem.description}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <span className={getStatusBadge(caseItem.status)}>
                    {caseItem.status}
                  </span>
                </td>
                <td>
                  <span className={getPriorityBadge(caseItem.priority)}>
                    {caseItem.priority}
                  </span>
                </td>
                <td>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-dark-400 mr-2" />
                    <span className="text-sm">
                      {caseItem.investigator.firstName} {caseItem.investigator.lastName}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center text-sm text-dark-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <Link
                    to={`/cases/${caseItem._id}`}
                    className="inline-flex items-center text-primary-400 hover:text-primary-300"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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