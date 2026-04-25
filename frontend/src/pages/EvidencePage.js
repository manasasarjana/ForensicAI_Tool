import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, FileText, AlertCircle, Eye, X, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const EvidencePage = () => {
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [caseEvidence, setCaseEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    caseId: '',
    description: '',
    tags: ''
  });

  // read caseId from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = params.get('caseId');
    if (pre) {
      setFormData(prev => ({ ...prev, caseId: pre }));
    }
  }, []);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoadingCases(true);
        const res = await axios.get('/api/cases?limit=100');
        setCases(res.data.cases || []);
      } catch (err) {
        console.error('Failed to load cases', err);
        setError('Unable to load cases.');
      } finally {
        setLoadingCases(false);
      }
    };

    fetchCases();
  }, []);

  // Fetch Evidence when caseId changes
  useEffect(() => {
    if (!formData.caseId) {
      setCaseEvidence([]);
      return;
    }
    const fetchEvidence = async () => {
      try {
        setLoadingEvidence(true);
        const res = await axios.get(`/api/evidence/case/${formData.caseId}?limit=10`);
        setCaseEvidence(res.data.evidence || []);
      } catch (err) {
        console.error('Failed to load evidence', err);
      } finally {
        setLoadingEvidence(false);
      }
    };
    fetchEvidence();
  }, [formData.caseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleViewFile = (fileId) => {
    if (!fileId) return;
    const token = localStorage.getItem('accessToken'); // use accessToken as defined in AuthContext
    const baseUrl = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
    setPreviewUrl(`${baseUrl}/api/evidence/${fileId}/download?inline=true&token=${token}`);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Are you sure you want to delete this evidence? This action cannot be undone and will be logged.')) {
      return;
    }

    try {
      const res = await axios.delete(`/api/evidence/${evidenceId}`);
      toast.success(res.data.message);
      
      // Refresh the list
      setCaseEvidence(prev => prev.filter(ev => ev._id !== evidenceId));
    } catch (err) {
      console.error('Delete failed', err);
      toast.error(err.response?.data?.message || 'Failed to delete evidence');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseId) {
      setError('Please select a case');
      return;
    }
    if (files.length === 0) {
      setError('Please choose at least one file');
      return;
    }

    const payload = new FormData();
    payload.append('caseId', formData.caseId);
    if (formData.description) payload.append('description', formData.description);

    // Handle tags properly - split by comma and add each tag individually
    if (formData.tags) {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      tagsArray.forEach(tag => {
        payload.append('tags', tag);
      });
    }

    files.forEach(f => payload.append('evidence', f));

    try {
      setUploading(true);
      const res = await axios.post('/api/evidence/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        setError('');
        toast.success(res.data.message);
        // Reset form except caseId so they can see it in the list
        setFormData(prev => ({ ...prev, description: '', tags: '' }));
        setFiles([]);
        // Refresh evidence list
        try {
          const evRes = await axios.get(`/api/evidence/case/${formData.caseId}?limit=10`);
          setCaseEvidence(evRes.data.evidence || []);
        } catch(e) {}
      }
    } catch (err) {
      console.error('Upload failed', err);
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-100">Evidence Upload</h1>
        <p className="text-dark-300 mt-2">Submit digital evidence tied to a case</p>
      </div>

      {loadingCases ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-6 p-6">
          {error && (
            <div className="text-center text-red-400">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Select Case *
            </label>
            <select
              name="caseId"
              value={formData.caseId}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">-- Select a Case --</option>
              {cases.map(c => (
                <option key={c._id} value={c._id}>
                  {c.caseId} – {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Provide a detailed description of the evidence context..."
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Tags (comma‑separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g. keylogger, financial, malware, priority"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Files *
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full text-dark-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Evidence'}
            </button>
          </div>
        </form>
      )}

      {/* Uploaded Evidence Viewer */}
      {formData.caseId && (
        <div className="card mt-8">
          <div className="card-header border-b border-dark-700 bg-dark-900/50">
            <h2 className="text-xl font-semibold text-dark-100 flex items-center">
               <FileText className="h-5 w-5 mr-2 text-primary-400" /> Evidence for Selected Case
            </h2>
          </div>
          <div className="card-body">
            {loadingEvidence ? (
              <LoadingSpinner />
            ) : caseEvidence.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-dark-400 border-b border-dark-700">
                    <tr>
                      <th className="pb-3 font-medium">File Name</th>
                      <th className="pb-3 font-medium">Hash</th>
                       <th className="pb-3 font-medium">Uploaded</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseEvidence.map((ev) => (
                      <tr key={ev._id} className="border-b border-dark-700/50 hover:bg-dark-800 transition-colors">
                        <td className="py-3 text-dark-100">{ev.originalName}</td>
                        <td className="py-3 font-mono text-[10px] text-dark-400">
                          {ev.status === 'processing' ? (
                            <span className="text-orange-400 animate-pulse italic">Hashing...</span>
                          ) : (
                            `${ev.sha256Hash?.substring(0, 16)}...`
                          )}
                        </td>
                        <td className="py-3 text-dark-400">{new Date(ev.createdAt).toLocaleDateString()}</td>
                         <td className="py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleViewFile(ev._id)}
                              className="p-1.5 bg-primary-900/30 text-primary-400 hover:bg-primary-900/50 rounded-md transition-colors"
                              title="Preview File"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvidence(ev._id)}
                              className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                              title="Delete Evidence"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-dark-400 text-sm">
                No evidence has been uploaded for this case yet.
              </div>
            )}
          </div>
        </div>
      )}
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

export default EvidencePage;