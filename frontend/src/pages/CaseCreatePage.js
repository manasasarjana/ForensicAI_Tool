import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, X, Plus, Trash2 } from 'lucide-react';

const CaseCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: '',
    location: '',
    priority: 'medium',
    suspects: [{ name: '', details: '' }],
    victims: [{ name: '', details: '' }],
    tags: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuspectChange = (index, field, value) => {
    const newSuspects = [...formData.suspects];
    newSuspects[index][field] = value;
    setFormData(prev => ({
      ...prev,
      suspects: newSuspects
    }));
  };

  const handleVictimChange = (index, field, value) => {
    const newVictims = [...formData.victims];
    newVictims[index][field] = value;
    setFormData(prev => ({
      ...prev,
      victims: newVictims
    }));
  };

  const addSuspect = () => {
    setFormData(prev => ({
      ...prev,
      suspects: [...prev.suspects, { name: '', details: '' }]
    }));
  };

  const removeSuspect = (index) => {
    setFormData(prev => ({
      ...prev,
      suspects: prev.suspects.filter((_, i) => i !== index)
    }));
  };

  const addVictim = () => {
    setFormData(prev => ({
      ...prev,
      victims: [...prev.victims, { name: '', details: '' }]
    }));
  };

  const removeVictim = (index) => {
    setFormData(prev => ({
      ...prev,
      victims: prev.victims.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        suspects: formData.suspects.filter(s => s.name.trim()),
        victims: formData.victims.filter(v => v.name.trim())
      };

      const response = await axios.post('/api/cases', submitData);
      
      if (response.status === 201) {
        navigate(`/cases/${response.data.case._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating case');
      console.error('Create case error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Create New Case</h1>
          <p className="text-dark-300 mt-2">Start a new forensic investigation</p>
        </div>
      </div>

      {error && (
        <div className="card bg-red-900 border border-red-700">
          <div className="card-body">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-dark-100">Basic Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Case Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter case title"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter case description"
                rows="4"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Incident Date *
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter incident location"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas (e.g., cyber, financial, urgent)"
                className="input-field"
              />
              <p className="text-xs text-dark-400 mt-1">Separate multiple tags with commas</p>
            </div>
          </div>
        </div>

        {/* Suspects */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark-100">Suspects</h2>
            <button
              type="button"
              onClick={addSuspect}
              className="btn-secondary text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Suspect
            </button>
          </div>
          <div className="card-body space-y-4">
            {formData.suspects.map((suspect, index) => (
              <div key={index} className="border border-dark-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-dark-300">Suspect {index + 1}</h3>
                  {formData.suspects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSuspect(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={suspect.name}
                      onChange={(e) => handleSuspectChange(index, 'name', e.target.value)}
                      placeholder="Suspect name"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-400 mb-1">
                      Details
                    </label>
                    <input
                      type="text"
                      value={suspect.details}
                      onChange={(e) => handleSuspectChange(index, 'details', e.target.value)}
                      placeholder="Additional details"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Victims */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark-100">Victims</h2>
            <button
              type="button"
              onClick={addVictim}
              className="btn-secondary text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Victim
            </button>
          </div>
          <div className="card-body space-y-4">
            {formData.victims.map((victim, index) => (
              <div key={index} className="border border-dark-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-dark-300">Victim {index + 1}</h3>
                  {formData.victims.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVictim(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={victim.name}
                      onChange={(e) => handleVictimChange(index, 'name', e.target.value)}
                      placeholder="Victim name"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-400 mb-1">
                      Details
                    </label>
                    <input
                      type="text"
                      value={victim.details}
                      onChange={(e) => handleVictimChange(index, 'details', e.target.value)}
                      placeholder="Additional details"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="btn-secondary"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseCreatePage;
