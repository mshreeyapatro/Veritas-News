import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PublishArticle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || (user.role !== 'admin' && user.role !== 'author')) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Access Denied</h2>
        <p>You must be an author or admin to publish articles.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, author: user.username };
      const response = await api.post('/news/publish', payload);
      navigate(`/article/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Publish New Article</h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}
      
      <form onSubmit={handlePublish} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange} required 
            style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1.1rem' }} 
            placeholder="Enter article title"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
          <select 
            name="category" value={formData.category} onChange={handleChange} 
            style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <option value="General">General</option>
            <option value="Technology">Technology</option>
            <option value="Politics">Politics</option>
            <option value="Business">Business</option>
            <option value="Health">Health</option>
          </select>
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Content</label>
           <textarea 
             name="content" value={formData.content} onChange={handleChange} required 
             style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', minHeight: '300px', fontSize: '1rem', fontFamily: 'inherit' }}
             placeholder="Write your article content here..."
           />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
          {loading ? 'Analyzing & Publishing...' : 'Publish Article'}
        </button>
      </form>
    </div>
  );
};

export default PublishArticle;
