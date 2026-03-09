import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const EvidencePage = () => {
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
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
        // Reset form
        setFormData({ caseId: '', description: '', tags: '' });
        setFiles([]);
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
    </div>
  );
};

export default EvidencePage;