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
  Eye,
  CheckCircle,
  X,
  Trash2
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CaseDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const { data, isLoading, error, refetch } = useQuery(
    ['case', id],
    async () => {
      const response = await axios.get(`/api/cases/${id}`);
      return response.data;
    }
  );

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

  const handleViewFile = async (fileId) => {
    if (!fileId) {
      toast.error('Unable to open file (invalid id)');
      return;
    }
    const token = localStorage.getItem('accessToken');
    const baseUrl = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
    setPreviewUrl(`${baseUrl}/api/evidence/${fileId}/download?inline=true&token=${token}`);
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

  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Are you sure you want to delete this evidence? This action cannot be undone and will be logged.')) {
      return;
    }

    try {
      const res = await axios.delete(`/api/evidence/${evidenceId}`);
      toast.success(res.data.message);
      
      // Refresh the query data
      refetch();
    } catch (err) {
      console.error('Delete failed', err);
      toast.error(err.response?.data?.message || 'Failed to delete evidence');
    }
  };

  const handleCloseCase = async () => {
    if (!window.confirm('Are you sure you want to CLOSE this case? This action is permanent and will lock the case for legal integrity.')) return;
    try {
      await axios.put(`/api/cases/${id}/close`);
      toast.success('Case closed successfully');
      window.location.reload(); // Refresh to reflect status
    } catch (err) {
      console.error('Close case error', err);
      toast.error(err?.response?.data?.message || 'Failed to close case');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await axios.delete(`/api/reports/${reportId}`);
      toast.success(res.data.message);
      
      // Refresh the query data
      refetch();
    } catch (err) {
      console.error('Delete failed', err);
      toast.error(err.response?.data?.message || 'Failed to delete report');
    }
  };

  const isClosed = caseData.status === 'closed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-dark-100">{caseData.title}</h1>
            <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-sm ${
              caseData.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              caseData.status === 'closed' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {caseData.status}
            </span>
            <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-sm ${
              caseData.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              caseData.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {caseData.priority}
            </span>
          </div>
          <p className="text-dark-300 font-mono">{caseData.caseId}</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {!isClosed && (
            <>
              <button className="btn-secondary">Edit Case</button>
              <button 
                className="btn-primary bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleCloseCase}
              >
                Close Case
              </button>
              <button className="btn-primary" onClick={handleGenerateReport}>Generate Report</button>
            </>
          )}
          {isClosed && (
            <div className="bg-dark-800 px-4 py-2 rounded-lg border border-dark-700 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-dark-200 font-medium">Case Finalized</span>
            </div>
          )}
        </div>
      </div>

      {/* Case Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-dark-800/40 backdrop-blur border border-dark-700 rounded-xl shadow-lg h-full">
            <div className="p-5 border-b border-dark-700 bg-dark-900/50">
              <h2 className="text-xl font-bold text-dark-100 uppercase tracking-wide">Case Metadata</h2>
            </div>
            <div className="p-6 space-y-4">
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
                      {caseData.investigator?.firstName || 'Unknown'} {caseData.investigator?.lastName || 'Investigator'}
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
          <div className="bg-dark-800/40 backdrop-blur border border-dark-700 rounded-xl shadow-lg h-full">
            <div className="p-5 border-b border-dark-700 bg-dark-900/50">
              <h3 className="text-lg font-bold text-dark-100 uppercase tracking-wide">Quick Stats</h3>
            </div>
            <div className="p-6 space-y-4">
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
      <div className="bg-dark-800/40 backdrop-blur border border-dark-700 rounded-xl shadow-lg">
        <div className="p-5 border-b border-dark-700 bg-dark-900/50 flex flex-col sm:flex-row sm:items-center justify-between">
          <h2 className="text-xl font-bold text-dark-100 uppercase tracking-wide">Evidence Chain</h2>
          {!isClosed && (
            <button className="btn-primary" onClick={handleUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Evidence
            </button>
          )}
        </div>
        <div className="p-0">
          {evidence && evidence.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-900/30 text-dark-400 text-xs uppercase tracking-wider border-b border-dark-700">
                  <tr>
                    <th className="p-4 font-medium">File Name</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Size</th>
                    <th className="p-4 font-medium">Hash (SHA-256)</th>
                    <th className="p-4 font-medium">Uploaded</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {evidence.map((item) => (
                    <tr key={item._id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="p-4">
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
                      <td className="p-4">
                        <span className="font-mono text-xs text-dark-400">
                          {item.status === 'processing' ? (
                            <span className="text-orange-400 animate-pulse italic">Hashing...</span>
                          ) : (
                            `${item.sha256Hash?.substring(0, 16)}...`
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-dark-300">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <button
                            className="bg-primary-900/30 text-primary-400 p-1.5 rounded hover:bg-primary-900/50 transition-colors"
                            onClick={() => handleViewFile(item._id)}
                            title="Preview File"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="bg-primary-900/30 text-primary-400 p-1.5 rounded hover:bg-primary-900/50 transition-colors"
                            onClick={() => handleDownloadFile(item._id)}
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {!isClosed && (
                            <button
                              className="bg-red-900/30 text-red-400 p-1.5 rounded hover:bg-red-900/50 transition-colors"
                              onClick={() => handleDeleteEvidence(item._id)}
                              title="Delete Evidence"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
      <div className="bg-dark-800/40 backdrop-blur border border-dark-700 rounded-xl shadow-lg mt-6">
        <div className="p-5 border-b border-dark-700 bg-dark-900/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-dark-100 uppercase tracking-wide">Forensic Reports</h2>
          {!isClosed && (
            <button className="btn-primary" onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          )}
        </div>
        <div className="p-6">
          {reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div key={report._id} className="border border-dark-700 bg-dark-800/50 rounded-xl p-5 hover:border-primary-500/50 transition-colors">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="font-medium text-dark-100">{report.title}</h3>
                      <p className="text-sm text-dark-400">
                        Generated by {report.generatedBy?.firstName || 'Unknown'} {report.generatedBy?.lastName || ''}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm ${
                        report.status === 'finalized' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        report.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        report.status === 'processing' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {report.status}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/reports/${report._id}`)}
                          className="bg-primary-900/30 text-primary-400 p-2 rounded-lg hover:bg-primary-900/50 transition-colors"
                          title="View Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {report.status !== 'finalized' && (
                          <button 
                            onClick={() => handleDeleteReport(report._id)}
                            className="bg-red-900/30 text-red-400 p-2 rounded-lg hover:bg-red-900/50 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-dark-700 bg-dark-900/80">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary-400" />
                Evidence Preview
              </h3>
              <button onClick={() => setPreviewUrl(null)} className="text-dark-400 hover:text-white p-1 rounded-md hover:bg-dark-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-dark-950 p-0 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full border-0" title="Evidence Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetailsPage;