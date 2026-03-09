import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  Calendar, 
  User, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  Upload,
  Download,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CaseDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useQuery(
    ['case', id],
    async () => {
      const response = await axios.get(`/api/cases/${id}`);
      return response.data;
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <p className="text-red-400">Error loading case: {error.message}</p>
      </div>
    );
  }

  const { case: caseData, evidence, reports } = data;

  // Define handlers after caseData is available
  const handleUploadClick = () => {
    navigate({ pathname: '/evidence', search: `?caseId=${caseData._id}` });
  };

  const handleViewFile = (fileId) => {
    if (!fileId) {
      toast.error('Unable to open file (invalid id)');
      return;
    }
    try {
      window.open(`/api/evidence/${fileId}/download?inline=true`, '_blank');
    } catch (e) {
      console.error('view file error', e);
      toast.error('Failed to open file');
    }
  };

  const handleDownloadFile = (fileId) => {
    if (!fileId) {
      toast.error('Unable to download file (invalid id)');
      return;
    }
    try {
      window.open(`/api/evidence/${fileId}/download`, '_blank');
    } catch (e) {
      console.error('download file error', e);
      toast.error('Failed to download file');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const title = `Report for ${caseData.caseId}`;
      const resp = await axios.post('/api/reports/generate-ai', {
        caseId: caseData._id,
        title
      });
      const newReport = resp.data.report;
      toast.success('Report generation started');
      // redirect to the report details page so the user can watch status
      navigate(`/reports/${newReport._id}`);
    } catch (err) {
      console.error('generate report error', err);
      const message = err?.response?.data?.message || 'Failed to start report';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-dark-100">{caseData.title}</h1>
            <span className={getStatusBadge(caseData.status)}>
              {caseData.status}
            </span>
            <span className={getPriorityBadge(caseData.priority)}>
              {caseData.priority}
            </span>
          </div>
          <p className="text-dark-300 font-mono">{caseData.caseId}</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="btn-secondary">Edit Case</button>
          <button className="btn-primary" onClick={handleGenerateReport}>Generate Report</button>
        </div>
      </div>

      {/* Case Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-dark-100">Case Information</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-400">Incident Date</p>
                    <p className="text-dark-100">
                      {new Date(caseData.incidentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-400">Investigator</p>
                    <p className="text-dark-100">
                      {caseData.investigator.firstName} {caseData.investigator.lastName}
                    </p>
                  </div>
                </div>
                
                {caseData.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-dark-400" />
                    <div>
                      <p className="text-sm text-dark-400">Location</p>
                      <p className="text-dark-100">{caseData.location}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-400">Priority</p>
                    <p className="text-dark-100 capitalize">{caseData.priority}</p>
                  </div>
                </div>
              </div>
              
              {caseData.description && (
                <div>
                  <p className="text-sm text-dark-400 mb-2">Description</p>
                  <p className="text-dark-100">{caseData.description}</p>
                </div>
              )}
              
              {caseData.tags && caseData.tags.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {caseData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-dark-700 text-dark-200 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-dark-100">Quick Stats</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Evidence Files</span>
                <span className="text-dark-100 font-semibold">{evidence?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Reports</span>
                <span className="text-dark-100 font-semibold">{reports?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Created</span>
                <span className="text-dark-100 font-semibold">
                  {new Date(caseData.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Last Updated</span>
                <span className="text-dark-100 font-semibold">
                  {new Date(caseData.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dark-100">Evidence Files</h2>
          <button className="btn-primary" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Evidence
          </button>
        </div>
        <div className="card-body">
          {evidence && evidence.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Hash (SHA-256)</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {evidence.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <p className="font-medium text-dark-100">{item.originalName}</p>
                        {item.description && (
                          <p className="text-sm text-dark-400">{item.description}</p>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-dark-300">{item.fileType}</span>
                      </td>
                      <td>
                        <span className="text-sm text-dark-300">
                          {formatFileSize(item.fileSize)}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-dark-400">
                          {item.sha256Hash.substring(0, 16)}...
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-dark-300">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                              <button
                            className="text-primary-400 hover:text-primary-300"
                            onClick={() => handleViewFile(item._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-primary-400 hover:text-primary-300"
                            onClick={() => handleDownloadFile(item._id)}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-100 mb-2">No evidence files</h3>
              <p className="text-dark-400 mb-4">Upload digital evidence to get started</p>
              <button className="btn-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload First Evidence
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reports Section */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dark-100">Reports</h2>
          <button className="btn-primary" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
        <div className="card-body">
          {reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="border border-dark-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-100">{report.title}</h3>
                      <p className="text-sm text-dark-400">
                        Generated by {report.generatedBy.firstName} {report.generatedBy.lastName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`status-badge ${
                        report.status === 'finalized' ? 'bg-green-100 text-green-800' :
                        report.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'processing' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                      <button className="text-primary-400 hover:text-primary-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-100 mb-2">No reports generated</h3>
              <p className="text-dark-400 mb-4">Generate your first forensic report</p>
              <button className="btn-primary">
                <FileText className="h-4 w-4 mr-2" />
                Generate First Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsPage;